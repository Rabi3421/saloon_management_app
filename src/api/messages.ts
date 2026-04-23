import apiClient from './client';

export interface Conversation {
  _id: string;
  salonId?: string;
  customerId?: string;
  salonName?: string;
  lastMessage?: string;
  unreadCount?: number;
  updatedAt?: string;
}

export interface ChatMessage {
  _id: string;
  text: string;
  from: 'user' | 'salon';
  createdAt: string;
}

export interface SendMessagePayload {
  salonId?: string;
  customerId?: string;
  text: string;
}

export async function getConversations(): Promise<Conversation[]> {
  const res = await apiClient.get('/api/messages');
  return res.data.data || [];
}

export async function getConversationThread(conversationId: string): Promise<ChatMessage[]> {
  const res = await apiClient.get(`/api/messages/${conversationId}`);
  return res.data.data || [];
}

export async function sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
  const res = await apiClient.post('/api/messages', payload);
  return res.data.data;
}
