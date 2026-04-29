import apiClient from './client';

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  bookingId?: string;
  salonName?: string;
  serviceName?: string;
}

export async function getMyReviews(): Promise<Review[]> {
  const res = await apiClient.get('/api/user/reviews');
  return res.data.data || [];
}

export async function getPublicReviews(limit = 10, page = 1): Promise<Review[]> {
  const res = await apiClient.get('/api/public/reviews', { params: { limit, page } });
  const data = res.data.data ?? res.data ?? [];
  return Array.isArray(data) ? data : data.reviews ?? [];
}

export async function submitReview(
  bookingId: string,
  payload: { rating: number; comment: string },
): Promise<Review> {
  const res = await apiClient.post(`/api/bookings/${bookingId}/review`, payload);
  return res.data.data;
}

export async function payForBooking(
  bookingId: string,
  paymentMethodId: string,
): Promise<void> {
  await apiClient.post(`/api/bookings/${bookingId}/pay`, { paymentMethodId });
}
