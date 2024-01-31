import { useDrawerContext } from "@/providers/drawer_provider";
import { AppTheme } from "@/styles";
import { useNavigation } from "expo-router";
import { useContext, useState } from "react";
import { StyleSheet } from "react-native";
import { Appbar, AppbarActionProps, Drawer, useTheme } from "react-native-paper";

export interface AppBarProps {
  title: string;
  showDrawer?: boolean;
  showBack?: boolean;
  actions?: AppbarActionProps[];
}

export function AppBar(props: AppBarProps) {
  const { toggle } = useDrawerContext();
  const style = useStyle(useTheme());
  const navigation = useNavigation();
  return (
    <Appbar.Header>
      {props.showBack && navigation.canGoBack() && <Appbar.BackAction />}
      <Appbar.Content title="Home" />
      {(props.actions || []).map((actionProps) => (
        <Appbar.Action {...actionProps} />
      ))}
      {!!props.showDrawer && <Appbar.Action icon="menu" onPress={toggle} />}
    </Appbar.Header>
  );
}

const useStyle = (theme: AppTheme) =>
  StyleSheet.create({
    drawer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });
