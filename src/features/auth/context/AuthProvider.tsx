import { useState, type ReactNode } from "react";
import { authService } from "../services/authService";
import type { AuthContextValue } from "./AuthContext";
import { AuthContext } from "./AuthContext";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  // Inicializa desde storage; sin useEffect para evitar setState en efecto
  const [user, setUser] = useState<AuthContextValue["user"]>(() => authService.getStoredUser());
  const [token, setToken] = useState<AuthContextValue["token"]>(() => authService.getToken());
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
