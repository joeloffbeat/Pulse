import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useWalletActions } from '../hooks/useWalletActions';
import {
  UserHeader,
  WalletCardList,
  WalletDetails,
  QuickActions,
  EmptyWalletState,
} from './profile';
import { InfoModal } from './shared/InfoModal';

export const MovementWalletPortfolio = () => {
  const {
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
  } = useWalletActions();

  if (!user) {
    return <EmptyWalletState type="not_logged_in" />;
  }

  if (isCreatingWallet) {
    return <EmptyWalletState type="creating_wallet" />;
  }

  if (movementWallets.length === 0) {
    return <EmptyWalletState type="loading" />;
  }

  const walletCountText = `${movementWallets.length} ${movementWallets.length === 1 ? 'wallet' : 'wallets'} connected`;

  return (
    <ScrollView style={styles.container}>
      <UserHeader
        title="Movement Expo"
        subtitle={walletCountText}
        onLogout={logout}
      />

      <WalletCardList
        wallets={movementWallets}
        activeAddress={activeWallet?.address}
        onSelectWallet={setSelectedWallet}
      />

      {activeWallet && (
        <>
          <WalletDetails
            address={activeWallet.address}
            balance={walletBalance}
          />
          <QuickActions
            onSendTransaction={handleSendTransaction}
            onGetAccountInfo={handleGetAccountInfo}
            onRequestFaucet={handleRequestFaucet}
            isLoadingSend={isLoadingSend}
            isLoadingInfo={isLoadingInfo}
            isLoadingFaucet={isLoadingFaucet}
          />
        </>
      )}

      <InfoModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        onClose={hideModal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
