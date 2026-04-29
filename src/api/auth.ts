import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';
import { SALON_ID } from './config';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterCustomerPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
}

export async function sendRegistrationOtp(email: string): Promise<void> {
  await apiClient.post('/api/auth/send-registration-otp', { email });
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

/** Persist token to AsyncStorage */
async function persistAuthData(data: AuthResponse) {
  await AsyncStorage.setItem('auth_token', data.token);
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  console.log('Logging in with', payload);
  const res = await apiClient.post('/api/auth/login', payload, {
    headers: SALON_ID ? { 'X-Salon-ID': SALON_ID } : undefined,
  });
  console.log('Login response', res.data);
  const data: AuthResponse = res.data.data;
  await persistAuthData(data);
  if (SALON_ID) {
    await AsyncStorage.setItem('salon_id', SALON_ID);
  }
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
