import { Stack } from 'expo-router';
import React, { createContext, useContext } from 'react';
import { useColorScheme as nativeUseColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

const ThemeContext = createContext({ theme: 'light', colors: Colors.light });

export const useTheme = () => useContext(ThemeContext);

export default function AuthLayout() {
  const colorScheme = nativeUseColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <ThemeContext.Provider value={{ theme: colorScheme, colors: themeColors }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
        <Stack.Screen name="index" options={{ title: 'Register' }} />

      </Stack>
    </ThemeContext.Provider>
  );
}
