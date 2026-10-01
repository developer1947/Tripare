import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { BreedListScreen } from '../screens/BreedListScreen';
import { BreedDetailScreen } from '../screens/BreedDetailScreen';
import { useAppTheme } from '../hooks/useAppTheme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.accent,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.danger,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '800' },
        },
      }}
    >
      <Stack.Navigator
        initialRouteName="BreedList"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="BreedList" component={BreedListScreen} />
        <Stack.Screen
          name="BreedDetail"
          component={BreedDetailScreen}
          options={({ route }) => ({
            title: route.params.breedName,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
