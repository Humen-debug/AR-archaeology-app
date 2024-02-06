import { customFonts, theme } from "@styles";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AuthProvider } from "@/providers/auth_provider";
import { FeathersProvider } from "@/providers/feathers_provider";

export default function RootLayout() {
  const [loadedFont, error] = useFonts(customFonts);
  if (!loadedFont) return null;
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <FeathersProvider>
              <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="search_result" options={{}} />
                  <Stack.Screen name="category" options={{}} />
                  <Stack.Screen name="detail" options={{}} />
                  <Stack.Screen name="ar_placement" options={{}} />
                  <Stack.Screen name="ar_explore" options={{}} />
                  <Stack.Screen name="collection" options={{}} />
                  <Stack.Screen name="profile" />
                </Stack>
                <StatusBar style="light" />
              </AuthProvider>
            </FeathersProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
