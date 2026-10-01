import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useBreedStore } from './src/store/useBreedStore';
import { useNetworkSync } from './src/hooks/useNetworkSync';

function MainApp(): React.JSX.Element {
  const initialize = useBreedStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useNetworkSync();

  return <RootNavigator />;
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider style={styles.container}>
      <ErrorBoundary fallbackTitle="Tripare Explorer Encountered an Error">
        <MainApp />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
