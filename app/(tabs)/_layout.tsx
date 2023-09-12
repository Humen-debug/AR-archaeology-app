import { Tabs } from "expo-router";

import { IconButton } from "react-native-paper";

export default function TabLayout() {
  return (
    <Tabs initialRouteName="home" screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{
          href: "/home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <IconButton icon="home" iconColor={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
