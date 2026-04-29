import apiClient from './client';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PromotionType = 'percentage' | 'flat' | 'gift_voucher' | 'free_service';

interface PopulatedSalon {
  _id: string;
  name: string;
  address?: string;
}

interface PopulatedService {
  _id: string;
  name: string;
  price: number;
  duration: number;
}

interface PopulatedStaff {
  _id: string;
  name: string;
  specialization?: string;
}

interface PopulatedCustomer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface PopulatedPromotion {
  _id: string;
  title: string;
  code: string;
  type: PromotionType;
  value: number;
  description?: string;
  terms?: string;
}

export interface Booking {
  _id: string;
  salonId?: string | PopulatedSalon;
  salonName?: string;
  serviceId: string | PopulatedService;
  serviceIds?: Array<string | PopulatedService>;
  staffId?: string | PopulatedStaff;
  customerId?: string | PopulatedCustomer;
  promotionId?: string | PopulatedPromotion;
  promotionCode?: string;
  promotionType?: PromotionType;
  bookingDate: string;
  timeSlot: string;
  status: BookingStatus;
  notes?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  paymentStatus?: 'unpaid' | 'paid';
}

export interface CreateBookingPayload {
  serviceId: string;
  staffId?: string;
  promotionId?: string;
  bookingDate: string; // 'YYYY-MM-DD'
  timeSlot: string;    // '10:00 AM'
  notes?: string;
}

function unwrapData<T>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

function normalizeBooking(raw: any): Booking {
  const serviceIds = Array.isArray(raw?.serviceIds) ? raw.serviceIds : [];
  const serviceId = raw?.serviceId ?? serviceIds[0];
  const salonName =
    typeof raw?.salonId === 'object' ? raw.salonId?.name : raw?.salonName;

  return {
    _id: String(raw?._id ?? ''),
    salonId: raw?.salonId,
    salonName,
    serviceId,
    serviceIds,
    staffId: raw?.staffId,
    customerId: raw?.customerId,
    promotionId: raw?.promotionId,
    promotionCode: raw?.promotionCode,
    promotionType: raw?.promotionType,
    bookingDate: raw?.bookingDate,
    timeSlot: raw?.timeSlot,
    status: raw?.status,
    notes: raw?.notes,
    subtotalAmount: raw?.subtotalAmount,
    discountAmount: raw?.discountAmount,
    totalAmount: raw?.totalAmount,
    paymentStatus: raw?.paymentStatus,
  };
}

export async function getBookings(): Promise<Booking[]> {
  const res = await apiClient.get('/api/bookings');
  const data = unwrapData<any[]>(res.data);
  return Array.isArray(data) ? data.map(normalizeBooking) : [];
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const res = await apiClient.post('/api/bookings', payload);
  return normalizeBooking(unwrapData(res.data));
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking> {
  const res = await apiClient.put(`/api/bookings/${id}`, { status });
  return normalizeBooking(unwrapData(res.data));
}
