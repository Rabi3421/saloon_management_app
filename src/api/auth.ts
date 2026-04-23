import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';
import { setSalonId } from './config';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterCustomerPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'staff' | 'customer' | 'admin';
}

export interface AuthResponse {
  token: string;
  user?: AuthUser;
  salon?: { _id: string; name: string };
}

/** Persist token and optional salon ID to AsyncStorage */
async function persistAuthData(data: AuthResponse) {
  await AsyncStorage.setItem('auth_token', data.token);
  if (data.salon?._id) {
    await AsyncStorage.setItem('salon_id', data.salon._id);
    setSalonId(data.salon._id);
  }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await apiClient.post('/api/auth/login', payload);
  const data: AuthResponse = res.data.data;
  await persistAuthData(data);
  return data;
}

export async function registerCustomer(
  payload: RegisterCustomerPayload,
): Promise<AuthResponse> {
  const res = await apiClient.post('/api/auth/register-customer', payload);
  const data: AuthResponse = res.data.data;
  await persistAuthData(data);
  return data;
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('salon_id');
  await AsyncStorage.removeItem('auth_user');
}

/** Restore token from storage on app start */
export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem('auth_token');
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
}

export async function storeUser(user: AuthUser): Promise<void> {
  await AsyncStorage.setItem('auth_user', JSON.stringify(user));
}
