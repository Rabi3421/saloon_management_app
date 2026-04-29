import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import {
  AppNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/notifications';

const TYPE_ICONS: Record<string, string> = {
  booking: '📅',
  promo: '🎁',
  reminder: '⏰',
  review: '⭐',
};

const TYPE_COLORS: Record<string, string> = {
  booking: Colors.primary,
  promo: '#F97316',
  reminder: '#EAB308',
  review: '#10B981',
};

interface Props {
  navigation: any;
}

export default function NotificationsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err: any) {
      setError(err?.message || 'Failed to load notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handlePress = async (item: AppNotification) => {
    if (!item.read) {
      try {
        await markNotificationRead(item._id);
        setNotifications(prev =>
          prev.map(n => (n._id === item._id ? { ...n, read: true } : n)),
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading notifications…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerWrap}>
          <Text style={styles.bigEmoji}>⚠️</Text>
          <Text style={styles.centerTitle}>Could not load notifications</Text>
          <Text style={styles.centerSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchNotifications}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id ?? String(Math.random())}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const type = item.type ?? 'booking';
            const icon = TYPE_ICONS[type] ?? '🔔';
            const color = TYPE_COLORS[type] ?? Colors.primary;
            const title = item.title ?? 'Notification';
            const body = item.body ?? '';
            return (
              <TouchableOpacity
                style={[styles.notifCard, !item.read && styles.notifCardUnread]}
                onPress={() => handlePress(item)}
                activeOpacity={0.8}>
                <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTopRow}>
                    <Text style={[styles.notifTitle, !item.read && styles.notifTitleBold]} numberOfLines={2}>
                      {title}
                    </Text>
                    <Text style={styles.notifTime}>{formatDate(item.createdAt)}</Text>
                  </View>
                  {!!body && <Text style={styles.notifBody} numberOfLines={2}>{body}</Text>}
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centerWrap}>
              <Text style={styles.bigEmoji}>🔔</Text>
              <Text style={styles.centerTitle}>No notifications yet</Text>
              <Text style={styles.centerSub}>You're all caught up! New updates will appear here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F1FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backArrow: { fontSize: 18, color: Colors.black },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  markAllText: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  notifCardUnread: { backgroundColor: '#F5F0FF', borderLeftWidth: 3, borderLeftColor: Colors.primary },
  iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconEmoji: { fontSize: 22 },
  notifContent: { flex: 1 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 },
  notifTitle: { fontSize: 14, color: Colors.text, flex: 1 },
  notifTitleBold: { fontWeight: '700' },
  notifTime: { fontSize: 11, color: Colors.textSecondary, flexShrink: 0 },
  notifBody: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 4, flexShrink: 0 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary },
  bigEmoji: { fontSize: 52, marginBottom: 16 },
  centerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  centerSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  retryText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
