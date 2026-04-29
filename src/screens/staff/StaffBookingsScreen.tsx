import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getBookings, updateBookingStatus, Booking, BookingStatus } from '../../api/bookings';
import { Colors } from '../../theme/colors';

const STATUS_META: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7', emoji: '⏳' },
  confirmed: { label: 'Confirmed', color: '#059669', bg: '#D1FAE5', emoji: '✅' },
  completed: { label: 'Done', color: '#4F46E5', bg: '#EDE9FE', emoji: '🎉' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2', emoji: '✗' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function StaffBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load your bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const changeStatus = (booking: Booking, newStatus: BookingStatus) => {
    Alert.alert(
      `Update to ${STATUS_META[newStatus].label}?`,
      'This will update the customer booking status.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              await updateBookingStatus(booking._id, newStatus);
              setBookings(prev => prev.map(item => item._id === booking._id ? { ...item, status: newStatus } : item));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update booking');
            }
          },
        },
      ],
    );
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(item => item.status === filter);

  const getServiceName = (booking: Booking) =>
    Array.isArray(booking.serviceIds) && booking.serviceIds.length > 0
      ? booking.serviceIds.map(item => typeof item === 'object' ? item.name : 'Service').join(', ')
      : typeof booking.serviceId === 'object'
      ? booking.serviceId.name
      : 'Service';

  const getCustomerName = (booking: Booking) =>
    typeof booking.customerId === 'object' ? booking.customerId?.name || 'Customer' : 'Customer';

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>{bookings.length} appointments assigned to you</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(item => {
          const active = filter === item.key;
          const count = item.key === 'all' ? bookings.length : bookings.filter(booking => booking.status === item.key).length;
          return (
            <TouchableOpacity key={item.key} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setFilter(item.key)}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
              <View style={[styles.countBadge, active && styles.countBadgeActive]}>
                <Text style={[styles.countText, active && styles.countTextActive]}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading bookings…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} colors={[Colors.primary]} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No bookings in this section yet.</Text>}
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status] || STATUS_META.pending;
            return (
              <View style={styles.card}>
                <View style={[styles.statusStrip, { backgroundColor: meta.color }]} />
                <View style={styles.cardBody}>
                  <View style={styles.topRow}>
                    <View>
                      <Text style={styles.customer}>{getCustomerName(item)}</Text>
                      <Text style={styles.service}>{getServiceName(item)}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.statusText, { color: meta.color }]}>{meta.emoji} {meta.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.meta}>📅 {new Date(item.bookingDate).toLocaleDateString('en-IN')} • 🕐 {item.timeSlot}</Text>
                  {!!item.notes && <Text style={styles.notes}>📝 {item.notes}</Text>}
                  {item.status === 'pending' && (
                    <View style={styles.actions}>
                      <TouchableOpacity style={[styles.actionBtn, styles.confirmBtn]} onPress={() => changeStatus(item, 'confirmed')}>
                        <Text style={styles.actionText}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => changeStatus(item, 'cancelled')}>
                        <Text style={[styles.actionText, { color: '#DC2626' }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {item.status === 'confirmed' && (
                    <View style={styles.actions}>
                      <TouchableOpacity style={[styles.actionBtn, styles.doneBtn]} onPress={() => changeStatus(item, 'completed')}>
                        <Text style={styles.actionText}>Mark Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F1FF' },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.white, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22 },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { color: Colors.text, fontWeight: '600' },
  filterTextActive: { color: Colors.white },
  countBadge: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  countText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700' },
  countTextActive: { color: Colors.white },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: 14, color: Colors.textSecondary },
  list: { padding: 16, paddingBottom: 30 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 50 },
  card: { backgroundColor: Colors.white, borderRadius: 18, marginBottom: 12, overflow: 'hidden' },
  statusStrip: { height: 5 },
  cardBody: { padding: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  customer: { fontSize: 16, fontWeight: '700', color: Colors.text },
  service: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, maxWidth: 190 },
  statusPill: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  statusText: { fontSize: 12, fontWeight: '700' },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 12 },
  notes: { fontSize: 12, color: Colors.textSecondary, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  confirmBtn: { backgroundColor: Colors.primary },
  doneBtn: { backgroundColor: '#4F46E5' },
  cancelBtn: { backgroundColor: '#FEE2E2' },
  actionText: { color: Colors.white, fontWeight: '700' },
});