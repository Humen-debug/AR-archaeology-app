import { User } from "@/models";
import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useFeathers } from "./feathers_provider";
import _ from "lodash";
import { to } from "@react-spring/three";

class AuthState {
  user?: User;
  token?: string;
}

interface LoginProps {
  email: string;
  password: string;
  strategy?: string;
}

class AuthContext {
  state: AuthState;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
  login: (props: LoginProps) => Promise<void>;
  logout: () => Promise<void>;
  register: ({ email, password }: { email: string; password: string }) => Promise<void>;
}

const AuthStore = createContext<AuthContext | null>(null);

interface Props {
  children: React.ReactNode;
  /** Function called when the app has no user */
  fallback?: () => void;
}

export function AuthProvider({ children, fallback }: Props) {
  const feathers = useFeathers();
  const [state, setState] = useState<AuthState>(new AuthState());

  /**
   * Retrieve authState from local storage
   */
  useLayoutEffect(() => {
    handleSocket();
    async function init() {
      let res = await fromStorage();
      if (res) setState(res);
      const user = await syncUser();
      if (user) {
        setState((state) => ({ ...state, user }));
      }
    }
    init();
  }, []);

  useEffect(() => {
    localSave();
  }, [state]);

  const localStorageKey = "authState";

  async function syncUser(): Promise<User | undefined> {
    if (state.token && state.user) {
      const me = await feathers.service("users").get(state.user._id);
      return me;
    }
    return;
  }

  async function localSave(): Promise<boolean> {
    const res = JSON.stringify(state);
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
  async function fromStorage(): Promise<AuthState | undefined> {
    try {
      let res = await SecureStore.getItemAsync(localStorageKey);
      if (res) {
        const state = JSON.parse(res);
        return state;
      }
    } catch (error) {
      console.log("Cannot get from local storage", error);
    }
  }

  async function updateUser(user: Partial<User>) {
    user = _.omit(user, ["_id", "createdAt"]);
    setState((state) => {
      if (state.user) state.user = { ...state.user, ...user };
      return state;
    });
  }

  async function setToken(token: string) {
    setState((state) => {
      state.token = token;
      return state;
    });
  }

  const isLogged: boolean = !!state.user;
  const authenticated: boolean = !!(state.token && state.token.length);

  function handleSocket() {
    if (feathers.io) {
      feathers.io.on("disconnect", () => {
        if (authenticated) {
          reAuthentication();
        }
      });
    }
  }

  async function login({ strategy = "local", email, password }: LoginProps) {
    const res = await feathers.service("authentication").create({ strategy, email: email.toLowerCase(), password });
    let token: string;
    let user: User;
    if (res.accessToken) {
      token = res.accessToken;
      console.log(token);
    }
    if (res.user) {
      user = res.user;
    }
    setState((state) => ({ ...state, token, user }));
  }

  async function register({ email, password }: { email: string; password: string }) {
    await feathers
      .service("users")
      .create({ email: email.toLowerCase(), password: password, bookmarks: state.user?.bookmarks ?? [], collections: state.user?.collections ?? [] });
  }

  async function reAuthentication() {
    let oldToken = state.token;
    if (!oldToken) {
      const res = await fromStorage();
      oldToken = res?.token;
    }
    if (!oldToken) return;
    const res = await feathers.service("authentication").create({ strategy: "jwt", accessToken: oldToken });
    const token = res.accessToken;
    setToken(token);
  }

  async function logout() {
    await feathers.service("authentication").remove(null);
    setState({});
    const deleteSuccess = await localDelete();
    console.log("logout success?", deleteSuccess);
  }

  return <AuthStore.Provider value={{ state, updateUser, setToken, login, logout, register }}>{children}</AuthStore.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthStore);
  if (!auth) throw Error("useAuth() must be inside the AuthProvider.");
  return auth;
}
