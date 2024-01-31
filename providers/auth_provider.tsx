import { useSegments, useRouter, useRootNavigation } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthState {
  token?: string;
}

interface AuthContext {
  state: AuthState;
  setState: (state: AuthState) => void;
}

const AuthContext = createContext<AuthContext | null>(null);

function useAuthRoute(authState: AuthState) {
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
  const [authState, setAuthState] = useState<AuthState>({});

  useAuthRoute(authState);

  return <AuthContext.Provider value={{ state: authState, setState: setAuthState }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside AuthProvider");
  return auth as AuthContext;
};
