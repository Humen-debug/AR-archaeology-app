import { NavBar } from "@components";
import { Tabs } from "expo-router/tabs";
import { HomeIcon, ExploreIcon, SettingIcon } from "@components/icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: null,
      }}
      tabBar={(props) => <NavBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          href: "/home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <HomeIcon fill={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          href: "/map",
          tabBarLabel: "Map",
          tabBarIcon: ({ color, size }) => <ExploreIcon fill={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          href: "/account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => <SettingIcon fill={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
