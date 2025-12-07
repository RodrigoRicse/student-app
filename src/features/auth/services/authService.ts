import axios from "axios";
import type { User } from "../types/User";

const AUTH_URL = "/auth";
const TOKEN_KEY = "studentapp_token";
const USER_KEY = "studentapp_user";

interface LoginResponse {
  token: string;
  user: User;
}

async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${AUTH_URL}/login`, {
    email,
    password,
  });

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const authService = {
  login,
  logout,
  getToken,
  getStoredUser,
};
