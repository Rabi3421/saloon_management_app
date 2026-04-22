import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

const MESSAGES = [
  { id: '1', name: 'Serenity Salon', last: 'Your appointment is confirmed!', time: '9:30 AM', unread: 2 },
  { id: '2', name: 'Uptown Hair', last: 'Thank you for your visit!', time: 'Yesterday', unread: 0 },
  { id: '3', name: 'Braids & Layers', last: 'We have a special offer for you', time: 'Mon', unread: 1 },
  { id: '4', name: 'The Cleanup', last: 'See you tomorrow at 2 PM!', time: 'Sun', unread: 0 },
];

export default function MessageScreen({ navigation }: { navigation: any }) {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor={Colors.grey}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={MESSAGES.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.messageRow} onPress={() => navigation.navigate('Chat', { name: item.name })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.messageInfo}>
              <View style={styles.messageTop}>
                <Text style={styles.messageName}>{item.name}</Text>
                <Text style={styles.messageTime}>{item.time}</Text>
              </View>
              <View style={styles.messageBottom}>
                <Text style={styles.messageLast} numberOfLines={1}>{item.last}</Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 30,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  list: { paddingHorizontal: 16 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 10,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  messageInfo: { flex: 1 },
  messageTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  messageName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  messageTime: { fontSize: 11, color: Colors.textSecondary },
  messageBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageLast: { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
});
