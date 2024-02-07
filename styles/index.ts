import { MD3DarkTheme, useTheme, configureFonts } from "react-native-paper";

export const customFonts = {
  "LibreCaslonText-Bold": require("@assets/fonts/LibreCaslonText-Bold.ttf"),
  "LibreCaslonText-Regular": require("@assets/fonts/LibreCaslonText-Regular.ttf"),
  "Lexend-Black": require("@assets/fonts/Lexend-Black.ttf"),
  "Lexend-Bold": require("@assets/fonts/Lexend-Bold.ttf"),
  "Lexend-ExtraBold": require("@assets/fonts/Lexend-ExtraBold.ttf"),
  "Lexend-ExtraLight": require("@assets/fonts/Lexend-ExtraLight.ttf"),
  "Lexend-Light": require("@assets/fonts/Lexend-Light.ttf"),
  "Lexend-Medium": require("@assets/fonts/Lexend-Medium.ttf"),
  "Lexend-Regular": require("@assets/fonts/Lexend-Regular.ttf"),
  "Lexend-Thin": require("@assets/fonts/Lexend-Thin.ttf"),
};

const _baseFontConfig = {
  fontFamily: "Lexend-Regular",
} as const;

const _titleFontConfig = {
  fontFamily: "LibreCaslonText-Regular",
} as const;

const _baseFontVar = configureFonts({ config: _baseFontConfig });
const _titleFontVar = configureFonts({ config: _titleFontConfig });

const fontConfig = {
  // displayLarge: {},
  // displayMedium: {},
  // displaySmall: {},
  // headlineLarge: {},
  headlineMedium: { ..._titleFontVar.headlineMedium, fontSize: 32 },
  headlineSmall: { ..._titleFontVar.headlineSmall, fontSize: 24, fontWeight: "600" },
  // titleLarge: {},
  titleMedium: { ..._titleFontVar.titleMedium, fontSize: 16, fontWeight: "600", lineHeight: 20 },
  titleSmall: { ..._titleFontVar.titleSmall, fontSize: 12 },
  labelLarge: { ..._baseFontVar.titleMedium, fontSize: 20 },
  labelMedium: { ..._baseFontVar.labelMedium, fontSize: 16, fontWeight: "600", lineHeight: 20 },
  labelSmall: { ..._baseFontVar.labelSmall, fontSize: 12 },
  bodySmall: {
    ..._baseFontVar.bodySmall,
    fontSize: 8,
  },
  bodyMedium: {
    ..._baseFontVar.bodyMedium,
    fontSize: 14,
    fontWeight: "300",
  },
  bodyLarge: {
    ..._baseFontVar.bodyLarge,
    fontSize: 14,
  },
} as const;

const fonts = configureFonts({
  config: {
    ..._titleFontVar,
    ..._baseFontVar,
    ...fontConfig,
  },
});

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
    label: "#6D6D6D",
    gradient: ["#DBF43E", "#DEF0A7"],
    gradientGreyTran: ["#E5E5E533 ", "#6D6D6D33"],
    gradientGrey: ["#404140", "#2C2D2C"],
    gradientBlack: ["#2D302D", "#2C2F2C"],
    gradientBackground: ["#191B19", "#222F2B"],
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
  fonts: fonts,
};
export type AppTheme = typeof theme;
export const useAppTheme = () => useTheme<AppTheme>();
