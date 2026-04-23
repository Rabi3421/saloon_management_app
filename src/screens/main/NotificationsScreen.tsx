import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  AppNotification,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark all read');
    }
  };

  const handlePress = async (item: AppNotification) => {
    if (!item.read) {
      try {
        await markNotificationRead(item._id);
        setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, read: true } : n));
      } catch {}
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <View style={{ width: 70 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifCard, !item.read && styles.notifCardUnread]}
            onPress={() => handlePress(item)}>
            <View style={[styles.iconCircle, { backgroundColor: TYPE_COLORS[item.type] + '20' }]}>
              <Text style={styles.iconEmoji}>{TYPE_ICONS[item.type]}</Text>
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifTopRow}>
                <Text style={[styles.notifTitle, !item.read && styles.notifTitleBold]}>
                  {item.title}
                </Text>
                <Text style={styles.notifTime}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
              </View>
              <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  backArrow: { fontSize: 18, color: Colors.black },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.black },
  markAllText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  notifCardUnread: { backgroundColor: '#F5F0FF', borderLeftWidth: 3, borderLeftColor: Colors.primary },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { fontSize: 13, color: Colors.text, flex: 1, marginRight: 8 },
  notifTitleBold: { fontWeight: '700' },
  notifTime: { fontSize: 11, color: Colors.textSecondary, flexShrink: 0 },
  notifBody: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
