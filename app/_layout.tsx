import * as React from "react";
import { AuthProvider } from "../providers/auth_provider";
import { customFonts, theme } from "../styles";
import { Stack } from "expo-router";

import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [loadedFont] = useFonts(customFonts);
  if (!loadedFont) return null;
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="search_result" options={{}} />
          <Stack.Screen name="category" options={{}} />
          <Stack.Screen name="detail" options={{}} />
        </Stack>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
