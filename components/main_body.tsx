import { Dimensions, View } from "react-native";
import { useAppTheme } from "../styles";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ReactElement, ReactNode } from "react";

interface MainBodyProps {
  children?: ReactElement;
  padding?: Partial<EdgeInsets>;
  backgroundColor?: string | string[];
}

export default function MainBody({ children, padding, backgroundColor }: MainBodyProps): JSX.Element {
  const theme = useAppTheme();
  const { top, bottom, left, right } = padding || useSafeAreaInsets();
  const bgColor: string[] = backgroundColor
    ? Array.isArray(backgroundColor)
      ? backgroundColor
      : [backgroundColor, backgroundColor]
    : [theme.colors.background, theme.colors.background];
  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <LinearGradient
        colors={bgColor}
        style={{ flex: 1, paddingTop: top, paddingBottom: bottom, paddingLeft: left, paddingRight: right, position: "relative" }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
