import { useDrawerContext } from "@providers/drawer_provider";
import { useAppTheme } from "@providers/style_provider";
import { useNavigation } from "expo-router";
import { Appbar, AppbarActionProps } from "react-native-paper";

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
    <Appbar.Header style={{ backgroundColor: props.backgroundColor ?? theme.colors.container }}>
      {props.showBack && navigation.canGoBack() && <Appbar.BackAction onPress={navigation.goBack} />}
      <Appbar.Content title={props.title ?? ""} titleStyle={{ fontWeight: "700" }} />
      {(props.actions || []).map((actionProps, index) => (
        <Appbar.Action key={index} {...actionProps} />
      ))}
      {!!props.showDrawer && <Appbar.Action icon="menu" onPress={useDrawerContext().toggle} />}
    </Appbar.Header>
  );
}
