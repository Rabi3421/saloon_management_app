import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import {
  getConversationThread,
  sendMessage,
  sendMessageInThread,
  pollMessages,
  markConversationRead,
  ChatMessage,
} from '../../api/messages';
import { getPublicSalonInfo } from '../../api/public';
import { SALON_ID } from '@env';

const POLL_INTERVAL_MS = 4000;

interface Props {
  navigation: any;
  route: any;
}

export default function ChatScreen({ navigation, route }: Props) {
  const salonName: string = route?.params?.name || 'Salon';
  const [conversationId, setConversationId] = useState<string>(route?.params?.conversationId || '');
  const salonId: string = route?.params?.salonId || '';
  const [salonPhone, setSalonPhone] = useState<string>(route?.params?.phone || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const lastMessageAtRef = useRef<string>('');
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load thread history & mark as read on open
  useEffect(() => {
    if (!conversationId) return;
    // Skip reload if we already loaded this thread (e.g. after first-send sets conversationId)
    if (messages.length > 0 && lastMessageAtRef.current) return;
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

  useEffect(() => {
    if (salonPhone) return;

    let mounted = true;

    (async () => {
      try {
        const salon = await getPublicSalonInfo();
        if (mounted) {
          setSalonPhone(salon.phone || '');
        }
      } catch {
        // Ignore phone fetch failure; call button will show a friendly alert.
      }
    })();

    return () => {
      mounted = false;
    };
  }, [salonPhone]);

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
      from: 'user',
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...(Array.isArray(prev) ? prev : []), optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      if (conversationId) {
        // Existing thread — use the dedicated send-in-thread endpoint
        const sent = await sendMessageInThread(conversationId, text);
        setMessages(prev =>
          prev.map(m => (m._id === optimistic._id ? { ...sent, from: 'user' as const } : m)),
        );
        lastMessageAtRef.current = sent.createdAt;
      } else {
        // New conversation — POST /api/messages to start/find thread
        const targetSalonId = salonId || SALON_ID;
        const result = await sendMessage(targetSalonId, text);
        const msg = result?.message ?? result;
        setMessages(prev =>
          prev.map(m => (m._id === optimistic._id ? { ...msg, from: 'user' as const } : m)),
        );
        if (result?.message?.createdAt) {
          lastMessageAtRef.current = result.message.createdAt;
        }
        // Save conversationId so further sends use the thread endpoint
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

  const handleCallSalon = useCallback(async () => {
    const sanitizedPhone = salonPhone.replace(/[^+\d]/g, '');

    if (!sanitizedPhone) {
      Alert.alert('Phone unavailable', 'The salon owner has not added a call number yet.');
      return;
    }

    const primaryDialerUrl = Platform.OS === 'ios'
      ? `telprompt:${sanitizedPhone}`
      : `tel:${sanitizedPhone}`;
    const fallbackDialerUrl = `tel:${sanitizedPhone}`;

    try {
      await Linking.openURL(primaryDialerUrl);
    } catch {
      try {
        await Linking.openURL(fallbackDialerUrl);
      } catch {
        Alert.alert(
          'Calling unavailable',
          'We could not open the phone app right now. If you are testing on a simulator or emulator, calling may not be supported there.',
        );
      }
    }
  }, [salonPhone]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{salonName[0]}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{salonName}</Text>
            <Text style={styles.headerStatus}>🟢 Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={handleCallSalon}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id ?? String(index)}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isUser = item.from === 'user';
          return (
            <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
              {!isUser && (
                <View style={styles.msgAvatar}>
                  <Text style={styles.msgAvatarText}>{salonName[0]}</Text>
                </View>
              )}
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleSalon]}>
                <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                  {item.text}
                </Text>
                <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 16, color: Colors.black },
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
  headerStatus: { fontSize: 11, color: Colors.green },
  callBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: { fontSize: 16 },
  messagesList: { paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  messageRowUser: { justifyContent: 'flex-end' },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  bubble: {
    maxWidth: '72%',
    borderRadius: 16,
    padding: 10,
    paddingBottom: 6,
  },
  bubbleSalon: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  bubbleTextUser: { color: Colors.white },
  bubbleTime: { fontSize: 10, color: Colors.grey, marginTop: 4, textAlign: 'right' },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.65)' },
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
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: { fontSize: 16 },
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
