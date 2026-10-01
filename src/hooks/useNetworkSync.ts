import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useBreedStore } from '../store/useBreedStore';

export function useNetworkSync() {
  const setOfflineStatus = useBreedStore((state) => state.setOfflineStatus);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOfflineStatus(!isOnline);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOfflineStatus(!isOnline);
    });

    return () => {
      unsubscribe();
    };
  }, [setOfflineStatus]);
}
