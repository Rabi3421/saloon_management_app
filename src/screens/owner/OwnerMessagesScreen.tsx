import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getOwnerConversations, Conversation } from '../../api/messages';

interface Props {
  navigation: any;
}

export default function OwnerMessagesScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchConversations = useCallback(async () => {
    try {
      const data = await getOwnerConversations();
      setConversations(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const getCustomerName = (c: Conversation): string => {
    if (typeof c.customerId === 'object' && c.customerId?.name) return c.customerId.name;
    return 'Customer';
  };

  const getCustomerIdStr = (c: Conversation): string => {
    if (typeof c.customerId === 'object') return c.customerId?._id ?? '';
    if (typeof c.customerId === 'string') return c.customerId;
    return '';
  };

  const filtered = conversations.filter(c =>
    getCustomerName(c).toLowerCase().includes(search.toLowerCase()),
  );

  const getInitial = (c: Conversation) => getCustomerName(c)[0].toUpperCase();

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor={Colors.grey}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>Customer messages will appear here</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.messageRow}
              onPress={() =>
                navigation.navigate('OwnerChat', {
                  conversationId: item._id,
                  name: getCustomerName(item),
                  customerId: getCustomerIdStr(item),
                })
              }>
              <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
                <Text style={styles.avatarText}>{getInitial(item)}</Text>
              </View>
              <View style={styles.messageInfo}>
                <View style={styles.messageTop}>
                  <Text style={styles.messageName}>{getCustomerName(item)}</Text>
                  <Text style={styles.messageTime}>{formatTime(item.lastMessageAt)}</Text>
                </View>
                <View style={styles.messageBottom}>
                  <Text style={styles.messageLast} numberOfLines={1}>
                    {item.lastMessage || 'No messages yet'}
                  </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyBorder,
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
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 30,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 44,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 16, color: Colors.textSecondary, marginTop: 12, fontWeight: '600' },
  emptySubtitle: { fontSize: 13, color: Colors.grey, marginTop: 6 },
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
