import { MD3DarkTheme, useTheme } from "react-native-paper";

export const theme = {
  ...MD3DarkTheme,
  myOwnProperty: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#427e55",
    secondary: "#f4c03e",
    tertiary: "#B07f2f",
    highlight: "#dbf43e",
    highlight2: "#def0a7",
    background: "#131A13",
    container: "#222f2b",
    grey1: "#fffffd",
    grey2: "#a4a2a2",
    grey3: "#736e6e",
    grey4: "#363535",
    gradientBlack: ["#2D302D", "#2C2F2C"],
    onSurfaceVariant: "white",
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 32,
  },
  breakpoint: {
    xs: 600,
    sm: 960,
    md: 1264,
    lg: 1904,
    xl: 1904,
  },
};
export type AppTheme = typeof theme;
export const useAppTheme = () => useTheme<AppTheme>();
