import dotenv from 'dotenv';
dotenv.config(); // Must run BEFORE other imports that read env vars

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { toHex } from 'viem';
import {
    Aptos,
    AptosConfig,
    Network,
    AccountAddress,
    AccountAuthenticatorEd25519,
    Ed25519PublicKey,
    Ed25519Signature,
    generateSigningMessageForTransaction,
    SimpleTransaction,
    Hex,
    Deserializer,
} from '@aptos-labs/ts-sdk';

// Pulse routes
import pulseRoutes from './routes/pulse.js';
// Shinami Gas Station integration
import { getRpcUrl, isGasStationEnabled, shouldSponsor } from './services/shinami.js';

const app = express();
const port = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// --- Aptos SDK Setup with Shinami Node Service ---
const RPC_URL = getRpcUrl();
const FAUCET_URL = 'https://faucet.testnet.movementnetwork.xyz/mint';

// Shinami API for Gas Station
const SHINAMI_API_KEY = process.env.SHINAMI_KEY;
const SHINAMI_GAS_URL = 'https://api.shinami.com/aptos/gas/v1';

const aptosConfig = new AptosConfig({
    network: Network.CUSTOM,
    fullnode: RPC_URL,
});
const aptos = new Aptos(aptosConfig);

console.log(`🔗 Using RPC: ${RPC_URL.includes('shinami') ? 'Shinami Node Service' : 'Movement Testnet'}`);
console.log(`⛽ Gas Station: ${isGasStationEnabled() ? 'ENABLED' : 'DISABLED'}`);

// ======================================
// 1️⃣ Generate hash (with optional sponsorship)
// ======================================
app.post('/generate-hash', async (req, res) => {
    const { sender, function: func, typeArguments, functionArguments } = req.body;

    if (!sender || !func || !Array.isArray(functionArguments)) {
        return res.status(400).json({
            error: 'Missing required fields: sender, function, or functionArguments',
        });
    }

    const isSponsored = shouldSponsor(func);

    try {
        const senderAddress = AccountAddress.from(sender);

        // Build transaction (with fee payer if sponsored)
        const rawTxn = await aptos.transaction.build.simple({
            sender: senderAddress,
            withFeePayer: isSponsored,
            data: {
                function: func,
                typeArguments: typeArguments || [],
                functionArguments,
            },
        });

        // Generate hash for Privy signing
        const message = generateSigningMessageForTransaction(rawTxn);
        const hash = toHex(message);
        const rawTxnHex = rawTxn.bcsToHex().toString();

        res.json({
            success: true,
            hash,
            rawTxnHex,
            sponsored: isSponsored,
        });
    } catch (error) {
        console.error('Error generating signing hash:', error);
        res.status(500).json({ error: 'Failed to generate signing hash' });
    }
});

// ======================================
// 2️⃣ Submit signed transaction (with sponsorship)
// ======================================
app.post('/submit-transaction', async (req, res) => {
    const { rawTxnHex, publicKey, signature, sponsored } = req.body;

    if (!rawTxnHex || !publicKey || !signature) {
        return res.status(400).json({ error: 'Missing rawTxnHex, publicKey, or signature' });
    }

    // Process the public key
    let processedPublicKey = publicKey;
    if (processedPublicKey.toLowerCase().startsWith('0x')) {
        processedPublicKey = processedPublicKey.slice(2);
    }
    if (processedPublicKey.length === 66 && processedPublicKey.startsWith('00')) {
        processedPublicKey = processedPublicKey.substring(2);
    }
    if (processedPublicKey.length !== 64) {
        return res.status(400).json({
            error: `Invalid public key length: expected 64 characters, got ${processedPublicKey.length}`,
        });
    }

    try {
        const senderAuthenticator = new AccountAuthenticatorEd25519(
            new Ed25519PublicKey(processedPublicKey),
            new Ed25519Signature(signature)
        );

        const backendRawTxn = SimpleTransaction.deserialize(
            new Deserializer(Hex.fromHexInput(rawTxnHex).toUint8Array())
        );

        let pendingTxn;

        // If sponsored, get fee payer signature from Shinami
        if (sponsored && SHINAMI_API_KEY) {
            console.log('⛽ Sponsoring transaction via Shinami Gas Station...');

            const sponsorResponse = await fetch(SHINAMI_GAS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': SHINAMI_API_KEY,
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method: 'gas_sponsorTransaction',
                    params: {
                        transaction: rawTxnHex,
                        senderSignature: signature,
                        senderPublicKey: processedPublicKey,
                    },
                }),
            });

            const sponsorResult = await sponsorResponse.json();

            if (sponsorResult.error) {
                console.error('Shinami sponsorship error:', sponsorResult.error);
                // Fall back to non-sponsored submission
                console.log('⚠️ Falling back to non-sponsored transaction...');
                pendingTxn = await aptos.transaction.submit.simple({
                    transaction: backendRawTxn,
                    senderAuthenticator,
                });
            } else {
                // Submit sponsored transaction
                const { signedTransaction } = sponsorResult.result;
                pendingTxn = await aptos.transaction.submit.simple({
                    transaction: SimpleTransaction.deserialize(
                        new Deserializer(Hex.fromHexInput(signedTransaction).toUint8Array())
                    ),
                    senderAuthenticator,
                });
                console.log('✅ Transaction sponsored successfully');
            }
        } else {
            // Non-sponsored submission
            pendingTxn = await aptos.transaction.submit.simple({
                transaction: backendRawTxn,
                senderAuthenticator,
            });
        }

        const executedTxn = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });

        res.json({
            success: executedTxn.success,
            transactionHash: executedTxn.hash,
            vmStatus: executedTxn.vm_status,
            sponsored: sponsored && SHINAMI_API_KEY ? true : false,
        });
    } catch (error) {
        console.error('Error submitting signed transaction:', error);
        res.status(500).json({ error: 'Failed to submit signed transaction' });
    }
});

// ======================================
// 3️⃣ Faucet tokens
// ======================================
app.post('/faucet', async (req, res) => {
    const { address, amount } = req.body;
    if (!address || !amount) {
        return res.status(400).json({ error: 'Missing address or amount' });
    }

    try {
        const response = await fetch(`${FAUCET_URL}?amount=${amount}&address=${address}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Faucet request failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error requesting faucet tokens:', error);
        res.status(500).json({ error: 'Failed to request faucet tokens' });
    }
});

// ======================================
// 4️⃣ Get MOVE balance
// ======================================
app.get('/balance/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const accountAddress = AccountAddress.from(address);
        const balance = await aptos.getAccountAPTAmount({ accountAddress });
        res.json({ balance });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// ======================================
// 5️⃣ Get account info
// ======================================
app.get('/account-info/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const accountAddress = AccountAddress.from(address);
        const info = await aptos.getAccountInfo({ accountAddress });
        res.json(info);
    } catch (error) {
        console.error('Error fetching account info:', error);
        res.status(500).json({ error: 'Failed to fetch account info' });
    }
});

// ======================================
// 6️⃣ Health check (with Shinami status)
// ======================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        rpc: RPC_URL.includes('shinami') ? 'shinami' : 'movement',
        gasStation: isGasStationEnabled(),
    });
});

// ======================================
// 7️⃣ View function (read-only)
// ======================================
app.post('/view', async (req, res) => {
    const { function: func, typeArguments, functionArguments } = req.body;

    if (!func) {
        return res.status(400).json({ error: 'Missing required field: function' });
    }

    try {
        const result = await aptos.view({
            payload: {
                function: func,
                typeArguments: typeArguments || [],
                functionArguments: functionArguments || [],
            },
        });

        res.json({ success: true, result });
    } catch (error) {
        console.error('Error calling view function:', error);
        res.status(500).json({ error: 'Failed to call view function' });
    }
});

// ======================================
// 8️⃣ Gas Station status endpoint
// ======================================
app.get('/gas-station/status', async (req, res) => {
    if (!SHINAMI_API_KEY) {
        return res.json({
            enabled: false,
            message: 'Shinami API key not configured',
        });
    }

    try {
        const response = await fetch(SHINAMI_GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': SHINAMI_API_KEY,
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'gas_getFund',
                params: {},
            }),
        });

        const result = await response.json();

        if (result.error) {
            return res.json({
                enabled: true,
                error: result.error.message,
            });
        }

        res.json({
            enabled: true,
            fund: result.result,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get gas station status' });
    }
});

// ======================================
// Pulse Routes (markets, positions, leaderboard)
// ======================================
app.use(pulseRoutes);

app.listen(port, () => {
    console.log(`✅ Backend running at http://localhost:${port}`);
});
