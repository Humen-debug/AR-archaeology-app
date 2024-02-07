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
  const style = useStyle(theme);
  const navigation = useNavigation();
  return (
    <Appbar.Header style={{ backgroundColor: props.backgroundColor ?? theme.colors.background }}>
      {props.showBack && navigation.canGoBack() && <Appbar.BackAction onPress={navigation.goBack} />}
      {props.title && <Appbar.Content title={props.title} />}
      {(props.actions || []).map((actionProps) => (
        <Appbar.Action {...actionProps} />
      ))}
      {!!props.showDrawer && <Appbar.Action icon="menu" onPress={useDrawerContext().toggle} />}
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
