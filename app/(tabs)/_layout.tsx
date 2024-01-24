import NavBar from "@components/nav_bar";
import { Tabs } from "expo-router/tabs";
import HomeIcon from "@assets/icons/home.svg";
import ExploreIcon from "@assets/icons/explore.svg";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
        name="explore"
        options={{
          href: "/explore",
          tabBarLabel: "Explore",
          tabBarIcon: ({ color, size }) => <ExploreIcon fill={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
