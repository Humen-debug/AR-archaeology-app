import React from "react";
import { useSegments, useRouter, useRootNavigation } from "expo-router";
import { AuthState } from "@models/auth";
import { createContext, useContext, useEffect, useState } from "react";

type AuthType = {
  authState: AuthState | null;
  setAuthState: (state: AuthState | null) => void;
};

const AuthContext = createContext<AuthType>({ authState: null, setAuthState: () => {} });

export const useAuth = () => useContext(AuthContext);

function useAuthRoute(authState: any) {
  const segments = useSegments();
  const router = useRouter();
  const rootNav = useRootNavigation();
  const authed = segments[0] === "(auth)";
  useEffect(() => {
    if (!rootNav?.isReady) return;

    if (!authState && !authed) {
      router.replace("/login");
    } else if (authState && authed) {
      router.replace("/home");
    }
  }, [authState, segments]);
}

export function AuthProvider({ children }: { children: JSX.Element }): JSX.Element {
  const [authState, setAuthState] = useState<AuthState | null>(null);

  useAuthRoute(authState);
  const authContext: AuthType = { authState: authState, setAuthState };
  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
}
