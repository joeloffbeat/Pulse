import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePrivy } from '@privy-io/expo';
import { useCreateWallet } from '@privy-io/expo/extended-chains';
import { useMovementWallet } from './useMovement';

interface WalletAccount {
  address: string;
  public_key: string;
}

interface ModalState {
  visible: boolean;
  title: string;
  message: string;
}

export function useWalletActions() {
  const { user, logout } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { signAndSubmitTransaction, getWalletBalance, getAccountInfo, requestFaucet } =
    useMovementWallet();

  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isLoadingFaucet, setIsLoadingFaucet] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>({ visible: false, title: '', message: '' });

  const showModal = useCallback((title: string, message: string) => {
    setModal({ visible: true, title, message });
  }, []);

  const hideModal = useCallback(() => {
    setModal((prev) => ({ ...prev, visible: false }));
  }, []);

  const movementWallets: WalletAccount[] = useMemo(() => {
    if (!user?.linked_accounts) return [];
    return user.linked_accounts.filter(
      (account: any) => account.type === 'wallet' && account.chain_type === 'aptos'
    ) as WalletAccount[];
  }, [user?.linked_accounts]);

  useEffect(() => {
    const createMovementWallet = async () => {
      if (user && movementWallets.length === 0 && !isCreatingWallet) {
        setIsCreatingWallet(true);
        try {
          await createWallet({ chainType: 'aptos' });
          showModal('Success', 'Movement wallet created successfully!');
        } catch (error) {
          console.error('Failed to create Movement wallet:', error);
          showModal('Wallet Creation Failed', 'Failed to create Movement wallet. You can logout and try again.');
        } finally {
          setIsCreatingWallet(false);
        }
      }
    };
    createMovementWallet();
  }, [user, movementWallets.length, createWallet, isCreatingWallet, showModal]);

  const activeWallet = useMemo(() => {
    if (!selectedWallet) return movementWallets[0];
    return movementWallets.find((w) => w.address === selectedWallet) || movementWallets[0];
  }, [selectedWallet, movementWallets]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!activeWallet) return;
      try {
        const balance = await getWalletBalance(activeWallet.address);
        setWalletBalance(balance / 1e8);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    fetchBalance();
  }, [activeWallet, getWalletBalance]);

  const handleSendTransaction = useCallback(async () => {
    if (!activeWallet) return;
    setIsLoadingSend(true);
    try {
      const result = await signAndSubmitTransaction(
        (activeWallet as any).public_key,
        activeWallet.address,
        '0x1::aptos_account::transfer',
        [],
        ['0x9b0e90c9f3d8e5b3d8cfc9a0c0f9621c742e5675b4f4e772fbef457b73ef4e4a', 1_00000000]
      );
      showModal('Transaction Sent ✅', `Hash: ${result.transactionHash}\nStatus: ${result.vmStatus}`);
      const newBalance = await getWalletBalance(activeWallet.address);
      setWalletBalance(newBalance / 1e8);
    } catch (error: any) {
      console.error('Transaction error:', error);
      showModal('Transaction Failed', error.message || 'Failed to send transaction');
    } finally {
      setIsLoadingSend(false);
    }
  }, [activeWallet, signAndSubmitTransaction, getWalletBalance, showModal]);

  const handleGetAccountInfo = useCallback(async () => {
    if (!activeWallet) return;
    setIsLoadingInfo(true);
    try {
      const info = await getAccountInfo(activeWallet.address);
      const infoText = Object.entries(info).map(([key, value]) => `${key}: ${value}`).join('\n');
      showModal('Account Info', infoText);
    } catch {
      showModal('Error', 'Failed to fetch account info');
    } finally {
      setIsLoadingInfo(false);
    }
  }, [activeWallet, getAccountInfo, showModal]);

  const handleRequestFaucet = useCallback(async () => {
    if (!activeWallet) return;
    setIsLoadingFaucet(true);
    try {
      await requestFaucet(activeWallet.address, 1_00000000);
      showModal('Success', 'Faucet request submitted! Check your wallet in a few moments.');
      const balance = await getWalletBalance(activeWallet.address);
      setWalletBalance(balance / 1e8);
    } catch {
      showModal('Error', 'Failed to request faucet funds');
    } finally {
      setIsLoadingFaucet(false);
    }
  }, [activeWallet, requestFaucet, getWalletBalance, showModal]);

  return {
    user,
    logout,
    movementWallets,
    activeWallet,
    walletBalance,
    isCreatingWallet,
    isLoadingSend,
    isLoadingInfo,
    isLoadingFaucet,
    modal,
    hideModal,
    setSelectedWallet,
    handleSendTransaction,
    handleGetAccountInfo,
    handleRequestFaucet,
  };
}
