import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

interface Props {
  navigation: any;
  route: any;
}

const INITIAL_MESSAGES = [
  { id: '1', text: 'Hello! How can I help you today?', from: 'salon', time: '9:00 AM' },
  { id: '2', text: "Hi! I'd like to book an appointment for a haircut.", from: 'user', time: '9:01 AM' },
  { id: '3', text: 'Sure! We have slots available tomorrow. What time works for you?', from: 'salon', time: '9:02 AM' },
  { id: '4', text: 'How about 10 AM?', from: 'user', time: '9:03 AM' },
  { id: '5', text: "Perfect! 10 AM tomorrow is confirmed. See you then! 😊", from: 'salon', time: '9:04 AM' },
  { id: '6', text: 'Great, thank you!', from: 'user', time: '9:05 AM' },
  { id: '7', text: "Your appointment is confirmed!\n📅 Tomorrow, 10:00 AM\n✂️ Hair Cut - Short\n💰 $30", from: 'salon', time: '9:06 AM' },
];

export default function ChatScreen({ navigation, route }: Props) {
  const salonName = route?.params?.name || 'Serenity Salon';
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: String(Date.now()),
      text: input.trim(),
      from: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          text: 'Thanks for your message! We will get back to you shortly. 😊',
          from: 'salon',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
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
            <Text style={styles.headerAvatarText}>{salonName[0]}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{salonName}</Text>
            <Text style={styles.headerStatus}>🟢 Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callBtn}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
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
                  {item.time}
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
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendIcon}>➤</Text>
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
