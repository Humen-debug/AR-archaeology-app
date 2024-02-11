import { customFonts } from "@styles";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AuthProvider } from "@providers/auth_provider";
import { FeathersProvider } from "@providers/feathers_provider";
import { StyleProvider, useAppTheme } from "@providers/style_provider";

export default function RootLayout() {
  const [loadedFont, error] = useFonts(customFonts);
  if (!loadedFont) return null;
  return (
    <StyleProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <FeathersProvider>
              <AuthProvider>
                <StackLayout />
              </AuthProvider>
            </FeathersProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </StyleProvider>
  );
}

/**
 * Separates the layouts from above so that we can use `useAppTheme` context.
 * @returns Stack Layout and a Status Bar
 */
function StackLayout() {
  const { style } = useAppTheme();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />
        <Stack.Screen name="search_result" />
        <Stack.Screen name="category" />
        <Stack.Screen name="detail" />
        <Stack.Screen name="ar_placement" />
        <Stack.Screen name="ar_explore" />
        <Stack.Screen name="collection" />
        <Stack.Screen name="profile" />
      </Stack>
      <StatusBar style={style === "dark" ? "light" : "dark"} />
    </>
  );
}
