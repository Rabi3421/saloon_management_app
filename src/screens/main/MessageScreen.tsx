import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getConversations, Conversation } from '../../api/messages';

export default function MessageScreen({ navigation }: { navigation: any }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />
      ) : (
      <FlatList
        data={conversations.filter(m => (m.salonName || '').toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>💬</Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, marginTop: 12 }}>No conversations yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.messageRow}
            onPress={() => navigation.navigate('Chat', {
              conversationId: item._id,
              name: item.salonName || 'Salon',
              salonId: item.salonId,
            })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.salonName || 'S')[0]}</Text>
            </View>
            <View style={styles.messageInfo}>
              <View style={styles.messageTop}>
                <Text style={styles.messageName}>{item.salonName || 'Salon'}</Text>
                <Text style={styles.messageTime}>
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}
                </Text>
              </View>
              <View style={styles.messageBottom}>
                <Text style={styles.messageLast} numberOfLines={1}>{item.lastMessage || ''}</Text>
                {(item.unreadCount ?? 0) > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      )}
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
