import apiClient from './client';
import {SalonFeatureBanner, SalonInfo} from './public';

export interface OwnerSalonProfile extends SalonInfo {
  ownerName?: string;
  email?: string;
}

export interface UpdateSalonProfilePayload {
  name?: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  about?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  tagline?: string;
  images?: string[];
  featureBanners?: SalonFeatureBanner[];
}

export async function getSalonProfile(): Promise<OwnerSalonProfile> {
  const res = await apiClient.get('/api/salon/profile');
  return res.data.data ?? res.data;
}

export async function updateSalonProfile(
  payload: UpdateSalonProfilePayload,
): Promise<OwnerSalonProfile> {
  const res = await apiClient.put('/api/salon/profile', payload);
  return res.data.data ?? res.data;
}