import apiClient from './client';

export type PromotionType = 'percentage' | 'flat' | 'gift_voucher' | 'free_service';

export interface PromotionService {
  _id: string;
  name: string;
  price?: number;
  duration?: number;
  category?: string;
}

export interface Promotion {
  _id: string;
  title: string;
  code: string;
  description?: string;
  terms?: string;
  type: PromotionType;
  value: number;
  minBookingAmount?: number;
  startsAt?: string;
  endsAt?: string;
  appliesToServiceIds?: PromotionService[];
  usageLimit?: number;
  usageCount?: number;
  isActive?: boolean;
}

export interface PromotionPayload {
  title: string;
  code: string;
  description?: string;
  terms?: string;
  type: PromotionType;
  value?: number;
  minBookingAmount?: number;
  startsAt?: string;
  endsAt?: string;
  appliesToServiceIds?: string[];
  usageLimit?: number;
  isActive?: boolean;
}

function unwrapData<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

function normalizePromotion(raw: any): Promotion {
  return {
    _id: String(raw?._id ?? ''),
    title: raw?.title ?? '',
    code: raw?.code ?? '',
    description: raw?.description,
    terms: raw?.terms,
    type: raw?.type,
    value: Number(raw?.value ?? 0),
    minBookingAmount: Number(raw?.minBookingAmount ?? 0),
    startsAt: raw?.startsAt,
    endsAt: raw?.endsAt,
    appliesToServiceIds: Array.isArray(raw?.appliesToServiceIds) ? raw.appliesToServiceIds : [],
    usageLimit: raw?.usageLimit,
    usageCount: raw?.usageCount,
    isActive: raw?.isActive,
  };
}

export async function getOwnerPromotions(): Promise<Promotion[]> {
  const res = await apiClient.get('/api/promotions');
  const data = unwrapData<any[]>(res.data);
  return Array.isArray(data) ? data.map(normalizePromotion) : [];
}

export async function getPublicPromotions(): Promise<Promotion[]> {
  const res = await apiClient.get('/api/public/promotions');
  const data = unwrapData<any[]>(res.data);
  return Array.isArray(data) ? data.map(normalizePromotion) : [];
}

export async function createPromotion(payload: PromotionPayload): Promise<Promotion> {
  const res = await apiClient.post('/api/promotions', payload);
  return normalizePromotion(unwrapData(res.data));
}

export async function updatePromotion(id: string, payload: Partial<PromotionPayload>): Promise<Promotion> {
  const res = await apiClient.put(`/api/promotions/${id}`, payload);
  return normalizePromotion(unwrapData(res.data));
}

export async function deletePromotion(id: string): Promise<void> {
  await apiClient.delete(`/api/promotions/${id}`);
}
