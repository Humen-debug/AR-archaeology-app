import NavBar from "@components/nav_bar";
import { Tabs } from "expo-router/tabs";
import { HomeIcon, ExploreIcon } from "@/components/icons";

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
