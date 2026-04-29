import apiClient from './client';

export interface StaffMember {
  _id: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  isActive?: boolean;
  workingHours?: { day: string; start: string; end: string }[];
}

export interface StaffCredentialPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  specialization: string;
  isActive?: boolean;
  workingHours?: { day: string; start: string; end: string }[];
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  specialization?: string;
  isActive?: boolean;
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

export async function addStaff(payload: StaffCredentialPayload): Promise<StaffMember> {
  const res = await apiClient.post('/api/staff', payload);
  return res.data.data;
}

export async function updateStaff(
  id: string,
  payload: UpdateStaffPayload,
): Promise<StaffMember> {
  const res = await apiClient.put(`/api/staff/${id}`, payload);
  return res.data.data;
}

export async function deleteStaff(id: string): Promise<void> {
  await apiClient.delete(`/api/staff/${id}`);
}
