import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getBookings, updateBookingStatus, Booking, BookingStatus } from '../../api/bookings';
import { Colors } from '../../theme/colors';
import { bookingEventEmitter } from '../../notifications/notificationEvents';
import socketApi from '../../api/socket';
import DateFilterBar, { DateFilter, toBookingDateKey } from '../../components/DateFilterBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STATUS_META: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  pending: { label: 'Pending', color: '#D97706', bg: '#FEF3C7', emoji: '⏳' },
  confirmed: { label: 'Confirmed', color: '#059669', bg: '#D1FAE5', emoji: '✅' },
  started: { label: 'In Progress', color: '#0EA5A4', bg: '#D1FAF6', emoji: '🛠️' },
  completed: { label: 'Done', color: '#4F46E5', bg: '#EDE9FE', emoji: '🎉' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2', emoji: '✗' },
  rescheduled: { label: 'Rescheduled', color: '#F59E0B', bg: '#FFFBEB', emoji: '🔁' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'started', label: 'In Progress' },
  { key: 'completed', label: 'Done' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function StaffBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getBookings();
      setBookings(data || []);
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

  useEffect(() => {
    const unsub = bookingEventEmitter.on(() => {
      setRefreshing(true);
      fetchBookings().catch(() => setRefreshing(false));
    });
    let sock: any = null;
    (async () => {
      try {
        sock = await socketApi.connectSocket();
        sock.on('booking:created', () => {
          setRefreshing(true);
          fetchBookings().catch(() => setRefreshing(false));
        });
        sock.on('booking:updated', () => {
          setRefreshing(true);
          fetchBookings().catch(() => setRefreshing(false));
        });
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      try { if (sock) { sock.off('booking:created'); sock.off('booking:updated'); } } catch (e) {}
      unsub();
    };
  }, [fetchBookings]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings]),
  );

  const changeStatus = (booking: Booking, payload: { status: BookingStatus; rescheduledTo?: string } | BookingStatus) => {
    const status = typeof payload === 'string' ? payload : payload.status;
    const meta = STATUS_META[status];
    Alert.alert(
      `Update to ${meta.label}?`,
      `This will update the customer booking status to ${meta.label}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            try {
              await updateBookingStatus(booking._id, payload as any);
              setBookings(prev => prev.map(item => item._id === booking._id ? { ...item, status: status } : item));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update booking');
            }
          },
        },
      ],
    );
  };

  const todayKey = (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; })();

  const sorted = [...bookings].sort((a, b) => {
    const da = a.bookingDate || '';
    const db = b.bookingDate || '';
    if (db !== da) return db.localeCompare(da);
    return (b.timeSlot || '').localeCompare(a.timeSlot || '');
  });

  const filtered = sorted.filter(item => {
    const statusOk = filter === 'all' || item.status === filter;
    const bKey = toBookingDateKey(item.bookingDate);
    const dateOk = dateFilter === 'all' || (dateFilter === 'today' ? bKey === todayKey : bKey === dateFilter);
    return statusOk && dateOk;
  });

  const getServiceName = (booking: Booking) =>
    Array.isArray(booking.serviceIds) && booking.serviceIds.length > 0
      ? booking.serviceIds.map(item => typeof item === 'object' ? item.name : 'Service').join(', ')
      : typeof booking.serviceId === 'object'
      ? booking.serviceId.name
      : 'Service';

  const getCustomerName = (booking: Booking) =>
    typeof booking.customerId === 'object' ? booking.customerId?.name || 'Customer' : 'Customer';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSub}>{bookings.length} total appointments</Text>
        </View>
        <View style={styles.pendingWrapper}>
          <Text style={styles.pendingText}>{bookings.filter(b => b.status === 'pending').length} need action</Text>
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => {
            const count = f.key === 'all' ? bookings.length : bookings.filter(b => b.status === f.key).length;
            const active = filter === f.key;
            return (
              <TouchableOpacity key={f.key} style={[styles.filterTab, active && styles.filterTabActive]} onPress={() => setFilter(f.key)} activeOpacity={0.8}>
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>{f.label}</Text>
                {count > 0 && (
                  <View style={[styles.filterCount, active && styles.filterCountActive]}>
                    <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <DateFilterBar value={dateFilter} onChange={setDateFilter} />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loaderText}>Loading bookings…</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} colors={[Colors.primary]} tintColor={Colors.primary} />}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyEmoji}>📭</Text><Text style={styles.emptyTitle}>No bookings here</Text><Text style={styles.emptyDesc}>{filter === 'all' ? 'No appointments yet. They will appear here once customers book.' : `No ${filter} bookings at the moment.`}</Text></View>}
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status] ?? STATUS_META.pending;
            const customerName = getCustomerName(item);
            const serviceName = getServiceName(item);
            return (
              <View style={styles.card}>
                <View style={[styles.cardStripe, { backgroundColor: meta.color }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={[styles.avatar, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.avatarText, { color: meta.color }]}>{customerName[0]?.toUpperCase() ?? 'C'}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.customerName} numberOfLines={1}>{customerName}</Text>
                      <Text style={styles.serviceName} numberOfLines={1}>✂️  {serviceName}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.emoji}  {meta.label}</Text>
                    </View>
                  </View>

                  <View style={styles.dateRow}>
                    <View style={styles.dateChip}><Text style={styles.dateChipText}>📅  {new Date(item.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text></View>
                    <View style={styles.dateChip}><Text style={styles.dateChipText}>🕐  {item.timeSlot}</Text></View>
                  </View>

                  {!!item.promotionCode && <Text style={styles.offerText}>🎁 Offer used: {item.promotionCode}</Text>}

                  {/* Actions */}
                  {item.status === 'pending' && (
                    <View style={styles.actions}>
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnConfirm]} onPress={() => changeStatus(item, 'confirmed')} activeOpacity={0.85}><Text style={styles.actionBtnText}>✅  Confirm</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnCancel]} onPress={() => changeStatus(item, 'cancelled')} activeOpacity={0.85}><Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Cancel</Text></TouchableOpacity>
                    </View>
                  )}

                  {item.status === 'confirmed' && (
                    <View style={styles.actions}>
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnStart]} onPress={() => changeStatus(item, 'started')} activeOpacity={0.85}><Text style={styles.actionBtnText}>Start</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnReschedule]} onPress={() => {
                        try {
                          const scheduled = item.bookingDate ? new Date(item.bookingDate) : new Date();
                          const parts = item.timeSlot.split(':');
                          let hour = parseInt(parts[0], 10);
                          let minute = 0;
                          if (parts[1]) minute = parseInt(parts[1], 10) || 0;
                          scheduled.setHours(hour);
                          scheduled.setMinutes(minute + 30);
                          const iso = scheduled.toISOString();
                          changeStatus(item, { status: 'rescheduled', rescheduledTo: iso });
                        } catch (e) {
                          changeStatus(item, { status: 'rescheduled' });
                        }
                      }} activeOpacity={0.85}><Text style={styles.actionBtnText}>Reschedule +30m</Text></TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDone]} onPress={() => changeStatus(item, 'completed')} activeOpacity={0.85}><Text style={styles.actionBtnText}>🎉  Done</Text></TouchableOpacity>
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

const basePadding = SCREEN_WIDTH > 420 ? 20 : 14;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F1FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: basePadding, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  pendingWrapper: { backgroundColor: '#FEF3C7', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#FCD34D' },
  pendingText: { fontSize: 12, fontWeight: '700', color: '#D97706' },
  filterWrapper: { height: 56 },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: 'center' },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.greyBorder, gap: 8, height: 40, marginRight: 8 },
  filterTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.white },
  filterCount: { backgroundColor: '#EDE9FE', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterCountText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  filterCountTextActive: { color: Colors.white },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: 14, color: Colors.textSecondary },
  list: { paddingHorizontal: basePadding, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  card: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 18, marginBottom: 12, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  cardStripe: { width: 5 },
  cardBody: { flex: 1, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: '800' },
  cardInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '800', color: Colors.text },
  serviceName: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  dateRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dateChip: { backgroundColor: '#F4F1FF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  dateChipText: { fontSize: 12, color: Colors.text, fontWeight: '600' },
  offerText: { fontSize: 12, color: Colors.primary, fontWeight: '700', marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionBtnConfirm: { backgroundColor: '#059669' },
  actionBtnStart: { backgroundColor: '#059669' },
  actionBtnDone: { backgroundColor: Colors.primary },
  actionBtnCancel: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#FECACA' },
  actionBtnReschedule: { backgroundColor: '#F59E0B' },
  actionBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});