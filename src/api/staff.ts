import apiClient from './client';

export interface StaffMember {
  _id: string;
  name: string;
  phone?: string;
  specialization: string;
  workingHours?: { day: string; start: string; end: string }[];
}

export async function getStaff(): Promise<StaffMember[]> {
  const res = await apiClient.get('/api/staff');
  return res.data.data || [];
}

export async function getPublicStaff(): Promise<StaffMember[]> {
  const res = await apiClient.get('/api/public/staff');
  return res.data.data || [];
}

export async function addStaff(payload: Omit<StaffMember, '_id'>): Promise<StaffMember> {
  const res = await apiClient.post('/api/staff', payload);
  return res.data.data;
}
