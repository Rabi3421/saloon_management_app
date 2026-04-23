import apiClient from './client';

export interface PaymentMethod {
  _id: string;
  cardholderName: string;
  last4: string;
  brand: string; // 'visa' | 'mastercard' | etc.
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface AddPaymentMethodPayload {
  cardholderName: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await apiClient.get('/api/user/payment-methods');
  return res.data.data || [];
}

export async function addPaymentMethod(payload: AddPaymentMethodPayload): Promise<PaymentMethod> {
  const res = await apiClient.post('/api/user/payment-methods', payload);
  return res.data.data;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await apiClient.delete(`/api/user/payment-methods/${id}`);
}

export async function setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
  const res = await apiClient.put(`/api/user/payment-methods/${id}`, { isDefault: true });
  return res.data.data;
}
