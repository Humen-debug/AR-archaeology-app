import { useDrawerContext } from "@providers/drawer_provider";
import { AppTheme, useAppTheme } from "@providers/style_provider";
import { useNavigation } from "expo-router";
import { StyleSheet } from "react-native";
import { Appbar, AppbarActionProps, Drawer, useTheme } from "react-native-paper";

export interface Props {
  title?: string;
  showDrawer?: boolean;
  showBack?: boolean;
  actions?: AppbarActionProps[];
  backgroundColor?: string;
}

export default function AppBar(props: Props) {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  return (
    <Appbar.Header style={{ backgroundColor: props.backgroundColor ?? theme.colors.background }}>
      {props.showBack && navigation.canGoBack() && <Appbar.BackAction onPress={navigation.goBack} />}
      <Appbar.Content title={props.title ?? ""} />
      {(props.actions || []).map((actionProps, index) => (
        <Appbar.Action key={index} {...actionProps} />
      ))}
      {!!props.showDrawer && <Appbar.Action icon="menu" onPress={useDrawerContext().toggle} />}
    </Appbar.Header>
  );
}
