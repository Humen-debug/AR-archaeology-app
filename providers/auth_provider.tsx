import { User } from "@/models";
import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
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
interface AuthRequest {
  strategy: string;
  [key: string]: any;
}

class AuthContext {
  readonly user?: User;
  updateUser: (user: Partial<User>) => Promise<void>;
  login: (props: AuthProps) => Promise<void>;
  logout: () => Promise<boolean>;
  register: (user: Partial<User>) => Promise<void>;
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
  const authPromise = useRef<Promise<void | null> | null>(null);
  const authenticated = useRef(false);
  /**
   * Retrieve authState from local storage
   */
  useEffect(() => {
    async function init() {
      handleFeathers();
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
      console.log("update latest user's info");
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

  const updateUser = useCallback(
    async (user: Partial<User>) => {
      user = _.omit(user, ["_id", "createdAt"]);
      var newUser: User;
      if (state.user?._id && state.token) {
        newUser = await feathers.service("users").patch(state.user._id, user);
        console.log(`patched result`, user);
      }
      setState((state) => ({ ...state, user: newUser ?? state.user }));
    },
    [state, setState]
  );

  function handleFeathers() {
    if (feathers.io) {
      feathers.io.on("disconnect", () => {
        const promise = new Promise((resolve) => feathers.io!.once("connect", () => resolve(undefined))).then(() =>
          authenticated.current ? reAuthentication(true) : null
        );
        authPromise.current = promise;
      });
    }

    feathers.post = async function (url: string, data: any, params: any) {
      const accessToken = state.token ?? (await fromStorage())?.token;
      return fetch(`${feathers.apiURL}/${url}`, {
        method: "POST",
        body: data,
        ...params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(params.headers || {}),
        },
      });
    };

    feathers.hooks({
      before: {
        async all(hook) {
          if (hook.path === "authentication" || hook.params?.noAuthCheck) return;
          if (!authenticated.current) {
            await reAuthentication();
          }
        },
      },
    });
  }

  const authentication = useCallback(
    async (req: AuthRequest) => {
      const promise = feathers
        .service("authentication")
        .create(req)
        .then((res) => {
          let token: string;
          let user: User;
          if (res.accessToken) {
            token = res.accessToken;
          }
          if (res.user) {
            user = res.user;
          }
          authenticated.current = true;

          setState((state) => ({ token, user: { ...state.user, ...user } }));
        });
      authPromise.current = promise;
      return promise;
    },
    [state, setState]
  );

  const login = useCallback(
    async function login({ strategy = "local", email, password }: AuthProps) {
      await authentication({ strategy, email, password });
    },
    [authentication]
  );

  const reAuthentication = async (force: boolean = false) => {
    if (!authPromise.current || force) {
      let oldToken = state.token;
      if (!oldToken) {
        const res = await fromStorage();
        oldToken = res?.token;
      }
      if (!oldToken) {
        console.log(`No access token stored in localStorage`);
        return;
      }
      try {
        return authentication({ strategy: "jwt", accessToken: oldToken });
      } catch (error) {
        console.warn("fail re-authentication");
      }
    }
    return authPromise.current;
  };

  async function register(newUser: Partial<User>) {
    await feathers.service("users").create(newUser);
  }

  const logout = useCallback(
    async function logout() {
      console.log("logout called");
      const authRes = await feathers.service("authentication").remove(null);
      authPromise.current = null;
      authenticated.current = false;

      setState({});
      const deleteSuccess = await localDelete();
      return authRes && deleteSuccess;
    },
    [state, setState]
  );

  return <AuthStore.Provider value={{ user: state.user, updateUser, login, logout, register }}>{children}</AuthStore.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthStore);
  if (!auth) throw Error("useAuth() must be inside the AuthProvider.");
  return auth;
}
