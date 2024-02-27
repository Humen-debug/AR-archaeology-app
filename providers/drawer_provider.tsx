import { router } from "expo-router";
import _ from "lodash";
import { createContext, useContext, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector, PanGestureHandler, TouchableOpacity } from "react-native-gesture-handler";
import { Drawer, IconButton } from "react-native-paper";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "./auth_provider";
import { useAppTheme, AppTheme } from "./style_provider";

interface DrawerContext {
  open: boolean;
  toggle: () => void;
}

const DrawerStore = createContext<DrawerContext | null>(null);

export const DrawerProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const { theme } = useAppTheme();
  const screen = Dimensions.get("window");
  const safePadding = useSafeAreaInsets();
  const { logout, user } = useAuth();

  const style = useStyle({ theme, screen, safePadding });
  const [open, setOpen] = useState(false);
  // init drawer as out of screen if drawer is not opened
  const offsetX = useSharedValue(screen.width);

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
  }));

  const toggleDrawer = () => {
    if (open) {
      // close
      offsetX.value = withTiming(offsetX.value + screen.width);
    } else {
      // open
      offsetX.value = withTiming(offsetX.value - screen.width);
    }
    setOpen((value) => !value);
  };
  // todo, enable to drag drawer
  const dragGesture = Gesture.Pan();

  const authenticated: boolean = !!user?._id;

  const handleLogout = async () => {
    if (authenticated) {
      await logout();
    } else {
      router.replace("/login");
    }
  };

  return (
    <DrawerStore.Provider value={{ open, toggle: toggleDrawer }}>
      <View style={{ position: "relative", display: "flex", flex: 1 }}>
        {children}
        {open && (
          <View style={[style.fill, { backgroundColor: theme.colors.backdrop }]}>
            <TouchableOpacity style={{ height: "100%", width: "100%" }} onPress={toggleDrawer} />
          </View>
        )}
        <GestureDetector gesture={dragGesture}>
          <Animated.View style={[style.drawer, animatedDrawerStyle]}>
            <View style={style.drawerContainer}>
              <IconButton icon="menu" onPress={toggleDrawer} />
              <Drawer.Section>
                <Drawer.Item
                  label="Profile"
                  onPress={() => {
                    router.push("/account/profile");
                  }}
                />
                <Drawer.Item label="Settings" />
                <Drawer.Item label={authenticated ? "Log out" : "Sign in"} onPress={handleLogout} />
              </Drawer.Section>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </DrawerStore.Provider>
  );
};

export const useDrawerContext = () => {
  const drawer = useContext(DrawerStore);
  if (!drawer) throw new Error("useDrawerContext must be used inside the DrawerProvider");
  return drawer;
};

const useStyle = ({ theme, screen, safePadding }: { theme: AppTheme; screen: { width: number; height: number }; safePadding?: EdgeInsets }) =>
  StyleSheet.create({
    drawer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      width: screen.width * 0.8,
      backgroundColor: theme.colors.background,
    },
    fill: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      display: "flex",
    },
    drawerContainer: {
      display: "flex",
      flexDirection: "column",
      paddingTop: safePadding?.top,
      position: "relative",
    },
  });
