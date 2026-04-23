import apiClient from './client';

export interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number; // minutes
  category: string;
  description?: string;
  isActive: boolean;
}

export async function getServices(): Promise<Service[]> {
  const res = await apiClient.get('/api/services');
  return res.data.data || [];
}

export async function getPublicServices(category?: string): Promise<Service[]> {
  const params = category ? { category } : {};
  const res = await apiClient.get('/api/public/services', { params });
  return res.data.data || [];
}

export async function createService(
  payload: Omit<Service, '_id' | 'isActive'>,
): Promise<Service> {
  const res = await apiClient.post('/api/services', payload);
  return res.data.data;
}

export async function updateService(
  id: string,
  payload: Partial<Service>,
): Promise<Service> {
  const res = await apiClient.put(`/api/services/${id}`, payload);
  return res.data.data;
}

export async function deleteService(id: string): Promise<void> {
  await apiClient.delete(`/api/services/${id}`);
}
