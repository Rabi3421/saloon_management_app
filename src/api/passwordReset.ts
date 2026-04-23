import apiClient from './client';

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/api/auth/forgot-password', { email });
}

export async function verifyOtp(email: string, otp: string): Promise<string> {
  const res = await apiClient.post('/api/auth/verify-otp', { email, otp });
  // Backend returns a short-lived resetToken
  return res.data.data?.token || res.data.data?.resetToken;
}

export async function resetPassword(resetToken: string, newPassword: string): Promise<void> {
  await apiClient.post(
    '/api/auth/reset-password',
    { newPassword },
    { headers: { Authorization: `Bearer ${resetToken}` } },
  );
}
