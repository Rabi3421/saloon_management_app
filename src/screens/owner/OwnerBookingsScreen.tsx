import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getBookings, updateBookingStatus, Booking, BookingStatus } from '../../api/bookings';

interface Props {
  navigation: any;
}

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pending',
  confirmed: '✅ Confirmed',
  completed: '🎉 Completed',
  cancelled: '❌ Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#F97316',
  confirmed: '#10B981',
  completed: '#6366F1',
  cancelled: '#EF4444',
};

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OwnerBookingsScreen({ navigation }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = (booking: Booking, newStatus: BookingStatus) => {
    Alert.alert(
      'Update Status',
      `Mark this booking as "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await updateBookingStatus(booking._id, newStatus);
              setBookings(prev =>
                prev.map(b => b._id === booking._id ? { ...b, status: newStatus } : b),
              );
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update status');
            }
          },
        },
      ],
    );
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const getServiceName = (b: Booking) =>
    typeof b.serviceId === 'object' ? (b.serviceId as any).name : 'Service';
  const getCustomerName = (b: Booking) =>
    (b as any).userId?.name || (b as any).customerName || 'Customer';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
        <Text style={styles.count}>{filtered.length} total</Text>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={i => i.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key)}>
            <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getCustomerName(item)[0].toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.customerName}>{getCustomerName(item)}</Text>
                  <Text style={styles.serviceName}>{getServiceName(item)}</Text>
                  <Text style={styles.timeText}>📅 {item.bookingDate ? new Date(item.bookingDate).toLocaleDateString() : ''} • {item.timeSlot}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Action buttons based on current status */}
              {item.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => handleStatusChange(item, 'confirmed')}>
                    <Text style={styles.actionBtnText}>✅ Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                    onPress={() => handleStatusChange(item, 'cancelled')}>
                    <Text style={styles.actionBtnText}>❌ Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.status === 'confirmed' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#6366F1' }]}
                    onPress={() => handleStatusChange(item, 'completed')}>
                    <Text style={styles.actionBtnText}>🎉 Mark Complete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                    onPress={() => handleStatusChange(item, 'cancelled')}>
                    <Text style={styles.actionBtnText}>❌ Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  count: { fontSize: 13, color: Colors.textSecondary },
  filterList: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.greyBorder,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.white, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  cardInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  serviceName: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  timeText: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.greyBorder },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
});
