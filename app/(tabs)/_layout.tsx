import NavBar from "../../components/nav_bar";
import { Tabs } from "expo-router/tabs";
import HomeIcon from "../../assets/icons/home.svg";
import ProfileIcon from "../../assets/icons/profile.svg";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <NavBar {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          href: "/home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <HomeIcon fill={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: "/profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => <ProfileIcon fill={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
