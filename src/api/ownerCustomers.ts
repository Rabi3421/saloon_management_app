import apiClient from './client';

export interface OwnerCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  lastBookingAt?: string | null;
}

export async function getOwnerCustomers(params?: {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
}): Promise<OwnerCustomer[]> {
  const res = await apiClient.get('/api/owner/customers', { params });
  return res.data.data ?? res.data ?? [];
}

export async function updateOwnerCustomerStatus(
  customerId: string,
  isActive: boolean,
): Promise<OwnerCustomer> {
  const res = await apiClient.patch('/api/owner/customers', { customerId, isActive });
  return res.data.data ?? res.data;
}