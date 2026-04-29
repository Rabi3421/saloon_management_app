import apiClient from './client';

/**
 * Conversation list item.
 * API returns salonId and customerId as populated objects.
 */
export interface Conversation {
  _id: string;
  subject?: string;
  /** Populated: { _id, name } */
  salonId?: { _id: string; name: string } | string;
  /** Populated: { _id, name, phone } */
  customerId?: { _id: string; name: string; phone?: string } | string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageBy?: string;
  messageCount?: number;
  unreadCount?: number;
  isActive?: boolean;
}

export interface ChatMessage {
  _id: string;
  text: string;
  senderId?: string;
  senderRole?: string;
  /** Normalised: 'user' = customer side, 'salon' = owner side */
  from: 'user' | 'salon' | 'customer';
  createdAt: string;
}

export interface SendMessageResult {
  message: ChatMessage;
  conversationId: string;
  unreadCount: number;
  conversation?: Conversation;
  isNewConversation?: boolean;
}

export interface PollResult {
  messages: ChatMessage[];
  hasNew: boolean;
}

function toArray<T>(val: any): T[] {
  if (Array.isArray(val)) return val;
  return [];
}

function unwrapData<T = any>(payload: any): T {
  return (payload?.data ?? payload) as T;
}

function normaliseSender(m: any): ChatMessage {
  return {
    ...m,
    _id: m._id ?? m.id ?? String(m.createdAt ?? Date.now()),
    from: m.from === 'customer' || m.senderRole === 'customer' ? 'user' : (m.from ?? m.senderRole ?? 'salon'),
  };
}

/** Customer / Owner: list all their conversations */
export async function getConversations(): Promise<Conversation[]> {
  const res = await apiClient.get('/api/messages');
  const d = unwrapData(res.data);
  return toArray<Conversation>(d?.data ?? d?.conversations ?? d);
}

export async function getOwnerConversations(): Promise<Conversation[]> {
  return getConversations();
}

/**
 * Load paginated thread history.
 * GET /api/messages/:id?page=1&limit=50
 * Response: { conversation, messages, pagination }
 */
export async function getConversationThread(conversationId: string): Promise<ChatMessage[]> {
  const res = await apiClient.get(`/api/messages/${conversationId}?page=1&limit=50`);
  const d = unwrapData(res.data);
  const msgs = toArray<any>(d?.messages ?? d?.data ?? d);
  return msgs.map(normaliseSender);
}

/**
 * Poll for new messages since a timestamp.
 * GET /api/messages/:id?after=<ISO timestamp>
 * Response: { messages, hasNew }
 */
export async function pollMessages(conversationId: string, after: string): Promise<PollResult> {
  const res = await apiClient.get(`/api/messages/${conversationId}?after=${encodeURIComponent(after)}`);
  const d = unwrapData(res.data);
  const msgs = toArray<any>(d?.messages ?? []).map(normaliseSender);
  return { messages: msgs, hasNew: d?.hasNew ?? msgs.length > 0 };
}

/**
 * Send a message inside an existing conversation thread.
 * POST /api/messages/:conversationId  body: { text }
 * Response: { message, conversation }
 */
export async function sendMessageInThread(conversationId: string, text: string): Promise<ChatMessage> {
  const res = await apiClient.post(`/api/messages/${conversationId}`, { text });
  const d = unwrapData(res.data);
  return normaliseSender(d?.message ?? d);
}

/**
 * Mark a conversation as read (resets caller's unread count).
 * PATCH /api/messages/:id
 */
export async function markConversationRead(conversationId: string): Promise<void> {
  await apiClient.patch(`/api/messages/${conversationId}`);
}

/**
 * Customer starts or finds a conversation with a salon.
 * POST /api/messages  body: { salonId, text, subject? }
 * Response: { conversation, message, isNewConversation }
 */
export async function sendMessage(salonId: string, text: string): Promise<SendMessageResult> {
  const res = await apiClient.post('/api/messages', { salonId, text });
  return unwrapData<SendMessageResult>(res.data);
}

/**
 * Owner / Staff starts or finds a conversation with a customer.
 * POST /api/messages  body: { customerId, text, subject? }
 * Response: { conversation, message, isNewConversation }
 */
export async function sendOwnerMessage(customerId: string, text: string): Promise<SendMessageResult> {
  const res = await apiClient.post('/api/messages', { customerId, text });
  return unwrapData<SendMessageResult>(res.data);
}

