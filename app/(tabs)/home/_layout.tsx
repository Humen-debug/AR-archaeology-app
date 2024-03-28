import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="history" />
      <Stack.Screen name="livings" />
      <Stack.Screen name="hiking" />
      <Stack.Screen name="route" />
      <Stack.Screen name="event" />
      <Stack.Screen name="events" />
      <Stack.Screen name="attractions" />
      <Stack.Screen name="route_map" />
    </Stack>
  );
}
