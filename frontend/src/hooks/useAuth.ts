import { createContext, useContext } from "react";
import type { UserResponse } from "../api/userService";

interface DemoAuthState {
  token: string | null;
  user: UserResponse | null;
}

export interface AuthContextType {
  demoAuth: DemoAuthState;
  setDemoAuth: (token: string, user: UserResponse) => void;
  clearDemoAuth: () => void;
  isDemoAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

