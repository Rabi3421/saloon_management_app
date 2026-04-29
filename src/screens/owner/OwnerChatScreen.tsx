import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import {
  getConversationThread,
  sendOwnerMessage,
  sendMessageInThread,
  pollMessages,
  markConversationRead,
  ChatMessage,
} from '../../api/messages';

const POLL_INTERVAL_MS = 4000;

interface Props {
  navigation: any;
  route: any;
}

export default function OwnerChatScreen({ navigation, route }: Props) {
  const customerName: string = route?.params?.name || 'Customer';
  const [conversationId, setConversationId] = useState<string>(route?.params?.conversationId || '');
  const customerId: string = route?.params?.customerId || '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const lastMessageAtRef = useRef<string>('');
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load thread history & mark as read on open
  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      try {
        const [thread] = await Promise.all([
          getConversationThread(conversationId),
          markConversationRead(conversationId).catch(() => {}),
        ]);
        const msgs = Array.isArray(thread) ? thread : [];
        setMessages(msgs);
        if (msgs.length > 0) {
          lastMessageAtRef.current = msgs[msgs.length - 1].createdAt;
        }
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load messages');
      }
    })();
  }, [conversationId]);

  // Poll for new messages every 4s while chat is open
  useEffect(() => {
    if (!conversationId) return;
    pollTimerRef.current = setInterval(async () => {
      if (!lastMessageAtRef.current) return;
      try {
        const result = await pollMessages(conversationId, lastMessageAtRef.current);
        if (result.hasNew && result.messages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m._id));
            const newMsgs = result.messages.filter(m => !existingIds.has(m._id));
            if (newMsgs.length === 0) return prev;
            lastMessageAtRef.current = newMsgs[newMsgs.length - 1].createdAt;
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
            return [...prev, ...newMsgs];
          });
        }
      } catch {
        // Silent poll failure
      }
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [conversationId]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const optimistic: ChatMessage = {
      _id: String(Date.now()),
      text,
      from: 'salon',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...(Array.isArray(prev) ? prev : []), optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      if (conversationId) {
        // Existing thread — use the dedicated send-in-thread endpoint
        const sent = await sendMessageInThread(conversationId, text);
        setMessages(prev =>
          prev.map(m => (m._id === optimistic._id ? { ...sent, from: 'salon' as const } : m)),
        );
        lastMessageAtRef.current = sent.createdAt;
      } else {
        // New conversation — POST /api/messages to start/find thread
        const result = await sendOwnerMessage(customerId, text);
        const msg = result?.message ?? result;
        setMessages(prev =>
          prev.map(m => (m._id === optimistic._id ? { ...msg, from: 'salon' as const } : m)),
        );
        if (result?.message?.createdAt) {
          lastMessageAtRef.current = result.message.createdAt;
        }
        const cid =
          result?.conversationId ??
          (typeof result?.conversation === 'object' ? result.conversation?._id : undefined);
        if (cid) setConversationId(cid);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send message');
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{customerName[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{customerName}</Text>
            <Text style={styles.headerStatus}>Customer</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id ?? String(index)}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No messages yet. Start the conversation.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSalon = item.from === 'salon';
          return (
            <View style={[styles.messageRow, isSalon && styles.messageRowSalon]}>
              {!isSalon && (
                <View style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarText}>{customerName[0].toUpperCase()}</Text>
                </View>
              )}
              <View style={[styles.bubble, isSalon ? styles.bubbleSalon : styles.bubbleCustomer]}>
                <Text style={[styles.bubbleText, isSalon && styles.bubbleTextSalon]}>
                  {item.text}
                </Text>
                <Text style={[styles.bubbleTime, isSalon && styles.bubbleTimeSalon]}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a reply..."
            placeholderTextColor={Colors.grey}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={sending}>
            <Text style={styles.sendIcon}>{sending ? '⏳' : '➤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyBorder,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: Colors.text },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  headerName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  headerStatus: { fontSize: 11, color: Colors.textSecondary },
  messagesList: { paddingHorizontal: 14, paddingVertical: 14 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, marginTop: 12, textAlign: 'center' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  messageRowSalon: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  bubble: {
    maxWidth: '72%',
    borderRadius: 16,
    padding: 10,
    paddingBottom: 6,
  },
  bubbleCustomer: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleSalon: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  bubbleTextSalon: { color: Colors.white },
  bubbleTime: { fontSize: 10, color: Colors.grey, marginTop: 4, textAlign: 'right' },
  bubbleTimeSalon: { color: 'rgba(255,255,255,0.65)' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.greyBorder,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.greyLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: { fontSize: 16, color: Colors.white },
});
