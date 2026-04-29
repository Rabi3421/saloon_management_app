import apiClient from './client';

export interface SalonInfo {
  _id: string;
  name: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  email?: string;
  website?: string;
  about?: string;
  tagline?: string;
  plan?: string;
  isActive?: boolean;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  logo?: string;
  coverImage?: string;
  location?: SalonLocation;
  featureBanners?: SalonFeatureBanner[];
  openingHours?: { day: string; start: string; end: string; closed?: boolean }[];
}

export interface SalonLocation {
  latitude: number;
  longitude: number;
}

export interface SalonFeatureBanner {
  title: string;
  subtitle?: string;
  image: string;
  ctaLabel?: string;
}

export interface PublicService {
  _id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  description?: string;
  isActive?: boolean;
}

export interface PublicStaff {
  _id: string;
  name: string;
  specialization?: string;
  avatar?: string;
  rating?: number;
}

export async function getPublicSalonInfo(): Promise<SalonInfo> {
  const res = await apiClient.get('/api/public/salon');
  return res.data.data ?? res.data;
}

export async function getPublicServices(params?: {
  category?: string;
  search?: string;
}): Promise<PublicService[]> {
  const res = await apiClient.get('/api/public/services', { params });
  return res.data.data ?? res.data ?? [];
}

export async function getPublicStaff(): Promise<PublicStaff[]> {
  const res = await apiClient.get('/api/public/staff');
  return res.data.data ?? res.data ?? [];
}
