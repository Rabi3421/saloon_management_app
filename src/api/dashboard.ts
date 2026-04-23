import apiClient from './client';

export interface DashboardStats {
  totalBookings?: number;
  todayBookings?: number;
  pendingBookings?: number;
  confirmedBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
  totalRevenue?: number;
  todayRevenue?: number;
  totalStaff?: number;
  totalServices?: number;
  totalCustomers?: number;
  recentBookings?: any[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await apiClient.get('/api/dashboard/stats');
  return res.data.data || {};
}
