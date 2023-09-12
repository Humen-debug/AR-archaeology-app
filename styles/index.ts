import { MD2DarkTheme, useTheme } from "react-native-paper";

export const theme = {
  ...MD2DarkTheme,
  myOwnProperty: true,
  colors: {
    ...MD2DarkTheme.colors,
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
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
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
