import { useAppTheme } from "@providers/style_provider";
import { router } from "expo-router";
import { Appbar, AppbarActionProps } from "react-native-paper";

export interface Props {
  title?: string;
  showBack?: boolean;
  actions?: AppbarActionProps[];
  backgroundColor?: string;
  goBack?: () => void;
}

export default function AppBar(props: Props) {
  const { theme } = useAppTheme();
  return (
    <Appbar.Header style={{ backgroundColor: props.backgroundColor ?? theme.colors.container }}>
      {props.showBack && router.canGoBack() && <Appbar.BackAction onPress={props.goBack ?? router.back} />}
      <Appbar.Content title={props.title ?? ""} titleStyle={{ fontWeight: "700" }} />
      {(props.actions || []).map((actionProps, index) => (
        <Appbar.Action key={index} {...actionProps} />
      ))}
    </Appbar.Header>
  );
}
