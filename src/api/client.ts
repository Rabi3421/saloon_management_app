import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, SALON_ID } from './config';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token + salon ID automatically
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach salon ID for public routes that need it
    const salonId = await AsyncStorage.getItem('salon_id') || SALON_ID;
    if (salonId && !config.headers['X-Salon-ID']) {
      config.headers['X-Salon-ID'] = salonId;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor: unwrap data, handle global errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
