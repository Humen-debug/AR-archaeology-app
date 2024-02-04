import { User } from "@/models";
import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useFeathers } from "./feathers_provider";
import _ from "lodash";

class AuthState {
  user?: User;
  token?: string;
}

interface AuthProps {
  email: string;
  password: string;
  strategy?: string;
}

class AuthContext {
  user?: User;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
  login: (props: AuthProps) => Promise<void>;
  logout: () => Promise<boolean>;
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
  const [state, setState] = useState<AuthState>(() => new AuthState());
  const authenticated: boolean = !!(state.token && state.token.length);
  /**
   * Retrieve authState from local storage
   */
  useLayoutEffect(() => {
    handleSocket();
    async function init() {
      reAuthentication();
      let res = await fromStorage();
      if (res) {
        setState(res);
      } else {
        // new user
        updateUser({ bookmarks: [], collections: [] });
      }
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
    if (state.token && state.user?._id) {
      try {
        const me = await feathers.service("users").get(state.user._id);
        return me;
      } catch (error) {
        console.warn(`fail to sync user`, error);
      }
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
      console.warn("Cannot get from local storage", error);
    }
  }

  async function updateUser(user: Partial<User>) {
    console.log(`update user called`);
    user = _.omit(user, ["_id", "createdAt"]);
    if (state.user?._id && state.token) {
      console.log(`patched user to server`);
      const res = await feathers.service("users").patch(state.user._id, state.user);
      user = { ...user, ...res };
    }
    setState((state) => {
      state.user ??= {};
      if (state.user) {
        state.user = { ...state.user, ...user };
      }
      return state;
    });
  }

  async function setToken(token: string) {
    setState((state) => {
      state.token = token;
      return state;
    });
  }

  function handleSocket() {
    if (feathers.io) {
      feathers.io.on("disconnect", async () => {
        if (authenticated) {
          await reAuthentication();
        }
      });
    }
  }

  async function login({ strategy = "local", email, password }: AuthProps) {
    const res = await feathers.service("authentication").create({ strategy, email: email.toLowerCase(), password });
    let token: string;
    let user: User;
    if (res.accessToken) {
      token = res.accessToken;
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
    if (!oldToken) {
      console.warn(`No access token stored in localStorage`);
      return;
    }
    const res = await feathers.service("authentication").create({ strategy: "jwt", accessToken: oldToken });
    const token = res.accessToken;
    console.log(`reauthenticate with token ${token}`);
    setToken(token);
  }

  async function logout() {
    const authRes = await feathers.service("authentication").remove(null);
    // todo need discussion on bookmarks and collections
    // should they be cached in local devices even when user logout or switch account?
    setState((state) => ({ user: { bookmarks: state.user?.bookmarks, collections: state.user?.collections } }));
    const deleteSuccess = await localDelete();
    return authRes && deleteSuccess;
  }

  return <AuthStore.Provider value={{ user: state.user, updateUser, setToken, login, logout, register }}>{children}</AuthStore.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthStore);
  if (!auth) throw Error("useAuth() must be inside the AuthProvider.");
  return auth;
}
