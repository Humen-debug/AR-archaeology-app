import { AppTheme, darkTheme, lightTheme } from "@/styles";
import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import * as SecureStore from "expo-secure-store";

export { AppTheme };

export type StyleEnum = "dark" | "light";
class StyleState {
  style: StyleEnum;
  theme: AppTheme;
}

class StyleContext {
  style: StyleEnum;
  theme: AppTheme;
  switchStyle: () => void;
}

const StyleStore = createContext<StyleContext | null>(null);

interface Props {
  children: React.ReactNode;
}

export function StyleProvider({ children }: Props) {
  const [state, setState] = useState<StyleState>({ style: "light", theme: lightTheme });

  useLayoutEffect(() => {
    async function init() {
      const style = await fromStorage();
      if (style) {
        setState({ style, theme: style === "dark" ? darkTheme : lightTheme });
      }
    }
    init();
  }, []);

  useEffect(() => {
    localSave();
  }, [state]);

  const localStorageKey = "styleState";
  async function localSave(): Promise<boolean> {
    const res = JSON.stringify(state.style);
    try {
      if (res) await SecureStore.setItemAsync(localStorageKey, res);
      return true;
    } catch {
      return false;
    }
  }
  async function localDelete(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(localStorageKey);
      return true;
    } catch {
      return false;
    }
  }
  async function fromStorage(): Promise<StyleEnum | undefined> {
    try {
      let res = await SecureStore.getItemAsync(localStorageKey);
      if (res) {
        const style = JSON.parse(res);
        return style;
      }
    } catch (error) {
      console.warn("Cannot get from local storage", error);
    }
  }

  function switchStyle() {
    if (state.style === "light") {
      setState({ style: "dark", theme: darkTheme });
    } else {
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
