import MainBody from "@components/main_body";
import { useRootNavigationState, Redirect, useRootNavigation, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native-paper";
import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";

export default function App() {
  const rootNav = useRootNavigation();
  const [isNavReady, setNavReady] = useState(false);

  useEffect(() => {
    const unsubscribe = rootNav?.addListener("state", (event) => {
      setNavReady(true);
    });
    return function cleanup() {
      unsubscribe && unsubscribe();
    };
  }, [rootNav]);

  useEffect(() => {
    if (!isNavReady) return;

    router.replace("/home");
  }, [isNavReady]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied", "The path explorer will not be able to start. Map also cannot show user location", [
          {
            text: "Open setting",
            onPress: () => {
              if (Platform.OS == "ios") {
                Linking.openURL("app-settings:");
              } else {
                IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS);
              }
            },
            style: "cancel",
          },
          { text: "Cancel", onPress: () => console.log("Cancel") },
        ]);
      }
    })();
  }, []);

  if (isNavReady) return <Redirect href="/home" />;
  else
    return (
      <MainBody>
        <ActivityIndicator size={"large"} />
      </MainBody>
    );
}
