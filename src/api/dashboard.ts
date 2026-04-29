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
  const data = res.data.data || {};
  return {
    totalBookings: data.totalBookings ?? data.bookings?.total ?? 0,
    todayBookings: data.todayBookings ?? 0,
    pendingBookings: data.pendingBookings ?? data.bookings?.pending ?? 0,
    confirmedBookings: data.confirmedBookings ?? data.bookings?.confirmed ?? 0,
    completedBookings: data.completedBookings ?? data.bookings?.completed ?? 0,
    cancelledBookings: data.cancelledBookings ?? data.bookings?.cancelled ?? 0,
    totalRevenue: data.totalRevenue ?? 0,
    todayRevenue: data.todayRevenue ?? 0,
    totalStaff: data.totalStaff ?? 0,
    totalServices: data.totalServices ?? 0,
    totalCustomers: data.totalCustomers ?? 0,
    recentBookings: data.recentBookings ?? [],
  };
}
