import { MD3LightTheme, configureFonts, MD3DarkTheme } from "react-native-paper";

export const customFonts = {
  "Poppins-Bold": require("@assets/fonts/Poppins-Bold.ttf"),
  "Poppins-Regular": require("@assets/fonts/Poppins-Regular.ttf"),
  "Poppins-Black": require("@assets/fonts/Poppins-Black.ttf"),
  "Poppins-ExtraBold": require("@assets/fonts/Poppins-ExtraBold.ttf"),
  "Poppins-ExtraLight": require("@assets/fonts/Poppins-ExtraLight.ttf"),
  "Poppins-Light": require("@assets/fonts/Poppins-Light.ttf"),
  "Poppins-Medium": require("@assets/fonts/Poppins-Medium.ttf"),
  "Poppins-SemiBold": require("@assets/fonts/Poppins-SemiBold.ttf"),
  "Poppins-Thin": require("@assets/fonts/Poppins-Thin.ttf"),
};

const _baseFontConfig = {
  fontFamily: "Poppins",
} as const;

const _baseFontVar = configureFonts({ config: _baseFontConfig });

const fontConfig = {
  // displayLarge: {},
  // displayMedium: {},
  // displaySmall: {},
  // headlineLarge: {},
  headlineMedium: { ..._baseFontVar.headlineMedium, fontSize: 32, fontWeight: "600" },
  headlineSmall: { ..._baseFontVar.headlineSmall, fontSize: 24, fontWeight: "700" },
  // titleLarge: {},
  titleMedium: { ..._baseFontVar.titleMedium, fontSize: 20, fontWeight: "700" },
  titleSmall: { ..._baseFontVar.titleSmall, fontSize: 12 },
  labelLarge: { ..._baseFontVar.titleMedium, fontSize: 16, fontWeight: "700" },
  labelMedium: { ..._baseFontVar.labelMedium, fontSize: 14, fontWeight: "700" },
  labelSmall: { ..._baseFontVar.labelSmall, fontSize: 12, fontWeight: "700" },
  bodySmall: { ..._baseFontVar.bodySmall, fontSize: 12 },
  bodyMedium: { ..._baseFontVar.bodyMedium, fontSize: 14 },
  bodyLarge: { ..._baseFontVar.bodyLarge, fontSize: 16 },
} as const;

const fonts = configureFonts({
  config: { ..._baseFontVar, ...fontConfig },
});

const spacings = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 40,
};

const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
};

const breakpoint = {
  xs: 600,
  sm: 960,
  md: 1264,
  lg: 1904,
  xl: 1904,
};

export const lightTheme = {
  ...MD3LightTheme,
  myOwnProperty: true,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#00AAF8",
    secondary: "#0160D6",
    tertiary: "#DEA516",
    success: "#AAB624",
    error: "#F13B13",
    background: "#FDFDFD",
    container: "#FFFFFF",
    grey1: "#1C1C1C",
    grey2: "#6D6D6D",
    grey3: "#A5AAB0",
    grey4: "#DEE3E4",
    text: "#1C1C1C",
    textOnPrimary: "#FFFFFD",

    white: "#FFFFFF",
    black: "#000000",

    gradient: ["#00AAF8", "#0160D6"],
    gradientBlack: ["#2D302D", "#2C2F2C"],
    shadowColor: "#00000026",
  },

  spacing: spacings,
  borderRadius: borderRadius,
  breakpoint: breakpoint,
  fonts: fonts,
};

export const darkTheme = {
  ...MD3DarkTheme,
  myOwnProperty: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#009EE7",
    secondary: "#0054BC",
    tertiary: "#D59E17",
    success: "#99A41F",
    error: "#BD2B18",
    background: "#1B1B20",
    container: "#282830",
    grey1: "#555555",
    grey2: "#90959A",
    grey3: "#A6ABB1",
    grey4: "#AEB0B4",
    text: "#FFFFFD",
    textOnPrimary: "#131313",

    white: "#FFFFFF",
    black: "#000000",

    gradient: ["##009EE7", "#0054BC"],
    gradientBlack: ["#2D302D", "#2C2F2C"],

    shadowColor: "#0000004D",
  },
  spacing: spacings,
  borderRadius: borderRadius,
  breakpoint: breakpoint,
  fonts: fonts,
};

export type AppTheme = typeof lightTheme;
