import { createContext, useState, type ReactNode } from "react";
import type { User } from "../types/User";
import { authService } from "../services/authService";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializa desde storage; sin useEffect para evitar setState en efecto
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [loading] = useState(false);

  const login = async (email: string, password: string) => {
    const { token: tk, user: usr } = await authService.login(email, password);
    setUser(usr);
    setToken(tk);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
