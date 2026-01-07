import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserResponse } from "../api/userService";
import { setDemoTokenStore } from "./authStore";
import { AuthContext, type AuthContextType } from "../hooks/useAuth";

interface DemoAuthState {
  token: string | null;
  user: UserResponse | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [demoAuth, setDemoAuthState] = useState<DemoAuthState>({
    token: null,
    user: null,
  });

  // Keep module-level store in sync with state
  useEffect(() => {
    setDemoTokenStore(demoAuth.token);
  }, [demoAuth.token]);

  const setDemoAuth = (token: string, user: UserResponse) => {
    setDemoAuthState({ token, user });
  };

  const clearDemoAuth = () => {
    setDemoAuthState({ token: null, user: null });
  };

  const isDemoAuthenticated = !!demoAuth.token;

  const value: AuthContextType = {
    demoAuth,
    setDemoAuth,
    clearDemoAuth,
    isDemoAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
