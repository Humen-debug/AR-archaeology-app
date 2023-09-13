import { useRootNavigationState, Redirect } from "expo-router";

export default function App() {
  const rootNavState = useRootNavigationState();
  if (!rootNavState?.key) return null;
  return <Redirect href={"/home"} />;
}
