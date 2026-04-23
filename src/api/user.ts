import apiClient from './client';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

export async function getMyProfile(): Promise<UserProfile> {
  const res = await apiClient.get('/api/user/profile');
  return res.data.data;
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const res = await apiClient.put('/api/user/profile', payload);
  return res.data.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.put('/api/user/profile', { currentPassword, newPassword });
}
