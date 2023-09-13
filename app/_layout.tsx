import * as React from "react";
import { AuthProvider } from "../providers/auth_provider";
import { theme } from "../styles";
import { Stack } from "expo-router";

import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        {/* <AuthProvider> */}
        <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {/* </AuthProvider> */}
      </SafeAreaProvider>
    </PaperProvider>
  );
}
