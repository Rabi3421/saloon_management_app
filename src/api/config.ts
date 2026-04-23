// Base URL for the SalonOS backend
// Android emulator routes "10.0.2.2" to the host machine's localhost.
// iOS simulator can use "localhost" directly.
import { Platform } from 'react-native';
export const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

// The salon ID for this specific salon app instance.
// In production, this would come from an env variable (NEXT_PUBLIC_SALON_ID)
// For now, it's stored here and gets set after first login/registration.
export let SALON_ID = '';

export const setSalonId = (id: string) => {
  SALON_ID = id;
};
