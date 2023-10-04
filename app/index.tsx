import MainBody from "../components/main_body";
import { useRootNavigationState, Redirect, useRootNavigation, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native-paper";

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

  if (isNavReady) return <Redirect href="/home" />;
  else
    return (
      <MainBody>
        <ActivityIndicator size={"large"} />
      </MainBody>
    );
}
