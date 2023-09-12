import { Dimensions, View } from "react-native";
import { useAppTheme } from "../styles";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainBody({ children, padding }: { children: JSX.Element; padding?: EdgeInsets }): JSX.Element {
  const theme = useAppTheme();
  const { top, bottom, left, right } = padding || useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        paddingTop: top,
        paddingBottom: bottom,
        paddingLeft: left,
        paddingRight: right,
        position: "relative",
      }}
    >
      {children}
    </View>
  );
}
