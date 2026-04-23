import apiClient from './client';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  _id: string;
  serviceId: string | { _id: string; name: string; price: number; duration: number };
  staffId?: string | { _id: string; name: string; specialization: string };
  bookingDate: string;
  timeSlot: string;
  status: BookingStatus;
  notes?: string;
  salonName?: string;
}

export interface CreateBookingPayload {
  serviceId: string;
  staffId?: string;
  bookingDate: string; // 'YYYY-MM-DD'
  timeSlot: string;    // '10:00 AM'
  notes?: string;
}

export async function getBookings(): Promise<Booking[]> {
  const res = await apiClient.get('/api/bookings');
  return res.data.data || [];
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const res = await apiClient.post('/api/bookings', payload);
  return res.data.data;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking> {
  const res = await apiClient.put(`/api/bookings/${id}`, { status });
  return res.data.data;
}
