import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  login as apiLogin,
  registerCustomer as apiRegister,
  logout as apiLogout,
  getStoredToken,
  storeUser,
  sendRegistrationOtp as apiSendOtp,
  AuthUser,
  LoginPayload,
  RegisterCustomerPayload,
} from '../api/auth';


interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterCustomerPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    token: null,
  });

  // Rehydrate auth state from AsyncStorage on app start
  useEffect(() => {
    (async () => {
      try {
        const token = await getStoredToken();
        const rawUser = await AsyncStorage.getItem('auth_user');
        const user: AuthUser | null = rawUser ? JSON.parse(rawUser) : null;

        setState({
          isLoading: false,
          isAuthenticated: !!token,
          user,
          token,
        });
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await apiLogin(payload);
    if (data.user) await storeUser(data.user);
    setState({
      isLoading: false,
      isAuthenticated: true,
      user: data.user ?? null,
      token: data.token,
    });
  }, []);

  const register = useCallback(async (payload: RegisterCustomerPayload) => {
    const data = await apiRegister(payload);
    if (data.user) await storeUser(data.user);
    setState({
      isLoading: false,
      isAuthenticated: true,
      user: data.user ?? null,
      token: data.token,
    });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      token: null,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
