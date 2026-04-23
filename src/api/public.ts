import apiClient from './client';

export interface SalonInfo {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  plan?: string;
  isActive?: boolean;
}

export async function getPublicSalonInfo(): Promise<SalonInfo> {
  const res = await apiClient.get('/api/public/salon');
  return res.data.data;
}
