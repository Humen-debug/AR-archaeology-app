import { AppTheme, darkTheme, lightTheme } from "@/styles";
import React, { createContext, useContext, useState } from "react";
import { PaperProvider } from "react-native-paper";

export { AppTheme };

export type StyleEnum = "dark" | "light" | "system";
class StyleState {
  style: StyleEnum;
  theme: AppTheme;
}

class StyleContext {
  style: StyleEnum;
  theme: AppTheme;
  switchStyle: (theme: StyleEnum) => void;
}

const StyleStore = createContext<StyleContext | null>(null);

interface Props {
  children: React.ReactNode;
}

export function StyleProvider({ children }: Props) {
  const [state, setState] = useState<StyleState>({ style: "light", theme: lightTheme });
  function switchStyle(theme: StyleEnum) {
    if (theme === "dark") {
      setState({ style: "dark", theme: darkTheme });
    } else if (theme === "light") {
      setState({ style: "light", theme: lightTheme });
    }
  }

  return (
    <StyleStore.Provider value={{ style: state.style, theme: state.theme, switchStyle }}>
      <PaperProvider theme={state.theme}>{children}</PaperProvider>
    </StyleStore.Provider>
  );
}

export function useAppTheme() {
  const theme = useContext(StyleStore);
  if (!theme) throw Error("useAppTheme() must be inside the StyleProvider.");
  return theme;
}
