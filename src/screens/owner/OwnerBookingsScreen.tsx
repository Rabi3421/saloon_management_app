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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getBookings, updateBookingStatus, Booking, BookingStatus } from '../../api/bookings';

interface Props {
  navigation: any;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', emoji: '⏳' },
  confirmed: { label: 'Confirmed', color: '#059669', bg: '#D1FAE5', emoji: '✅' },
  completed: { label: 'Done',      color: '#4F46E5', bg: '#EDE9FE', emoji: '🎉' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2', emoji: '✗'  },
};

const FILTERS: { key: string; label: string; emoji: string }[] = [
  { key: 'all',       label: 'All',       emoji: '📋' },
  { key: 'pending',   label: 'Pending',   emoji: '⏳' },
  { key: 'confirmed', label: 'Confirmed', emoji: '✅' },
  { key: 'completed', label: 'Done',      emoji: '🎉' },
  { key: 'cancelled', label: 'Cancelled', emoji: '✗'  },
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
    const meta = STATUS_META[newStatus];
    Alert.alert(
      `Mark as ${meta.label}?`,
      `This booking will be updated to "${meta.label}".`,
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: `Yes, ${meta.label}`,
          style: newStatus === 'cancelled' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await updateBookingStatus(booking._id, newStatus);
              setBookings(prev =>
                prev.map(b => (b._id === booking._id ? { ...b, status: newStatus } : b)),
              );
            } catch (err: any) {
              Alert.alert('Failed', err.message || 'Could not update booking');
            }
          },
        },
      ],
    );
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const getServiceName = (b: Booking) =>
    typeof b.serviceId === 'object' ? (b.serviceId as any).name : 'Service';
  const getCustomerName = (b: Booking) =>
    (b as any).userId?.name || (b as any).customerName || 'Customer';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bookings</Text>
          <Text style={styles.headerSub}>{bookings.length} total appointments</Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} need action</Text>
          </View>
        )}
      </View>

      {/* ── Filter Tabs ── */}
      <View style={styles.filterWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => {
          const count = f.key === 'all'
            ? bookings.length
            : bookings.filter(b => b.status === f.key).length;
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, active && styles.filterTabActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}>
              <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                {f.label}
              </Text>
              {count > 0 && (
                <View style={[styles.filterCount, active && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      </View>

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchBookings(); }}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>No bookings here</Text>
              <Text style={styles.emptyDesc}>
                {filter === 'all'
                  ? 'No appointments yet. They will appear here once customers book.'
                  : `No ${filter} bookings at the moment.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status] ?? STATUS_META.pending;
            const customerName = getCustomerName(item);
            const serviceName = getServiceName(item);
            return (
              <View style={styles.card}>
                {/* Status stripe */}
                <View style={[styles.cardStripe, { backgroundColor: meta.color }]} />

                <View style={styles.cardBody}>
                  {/* Top row: avatar + info + status pill */}
                  <View style={styles.cardTop}>
                    <View style={[styles.avatar, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.avatarText, { color: meta.color }]}>
                        {customerName[0].toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.customerName} numberOfLines={1}>{customerName}</Text>
                      <Text style={styles.serviceName} numberOfLines={1}>✂️  {serviceName}</Text>
                    </View>

                    <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.statusPillText, { color: meta.color }]}>
                        {meta.emoji}  {meta.label}
                      </Text>
                    </View>
                  </View>

                  {/* Date + time row */}
                  <View style={styles.dateRow}>
                    <View style={styles.dateChip}>
                      <Text style={styles.dateChipText}>
                        📅  {formatDate(item.bookingDate)}
                      </Text>
                    </View>
                    <View style={styles.dateChip}>
                      <Text style={styles.dateChipText}>
                        🕐  {item.timeSlot}
                      </Text>
                    </View>
                  </View>

                  {/* Action buttons */}
                  {item.status === 'pending' && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnConfirm]}
                        onPress={() => handleStatusChange(item, 'confirmed')}
                        activeOpacity={0.85}>
                        <Text style={styles.actionBtnText}>✅  Confirm Booking</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnCancel]}
                        onPress={() => handleStatusChange(item, 'cancelled')}
                        activeOpacity={0.85}>
                        <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {item.status === 'confirmed' && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnDone]}
                        onPress={() => handleStatusChange(item, 'completed')}
                        activeOpacity={0.85}>
                        <Text style={styles.actionBtnText}>🎉  Mark as Done</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnCancel]}
                        onPress={() => handleStatusChange(item, 'cancelled')}
                        activeOpacity={0.85}>
                        <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Cancel</Text>
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

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  pendingBadgeText: { fontSize: 12, fontWeight: '700', color: '#D97706' },

  /* Filter Tabs */
  filterWrapper: { height: 56 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: 'center' },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.greyBorder,
    gap: 6,
    height: 38,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTabTextActive: { color: Colors.white },
  filterCount: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterCountText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  filterCountTextActive: { color: Colors.white },

  /* Loader */
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: 14, color: Colors.textSecondary },

  /* List */
  list: { paddingHorizontal: 16, paddingBottom: 24 },

  /* Empty */
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  /* Card */
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardStripe: { width: 5 },
  cardBody: { flex: 1, padding: 16 },

  /* Card Top */
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '800' },
  cardInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '800', color: Colors.text },
  serviceName: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusPillText: { fontSize: 12, fontWeight: '700' },

  /* Date Row */
  dateRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  dateChip: {
    backgroundColor: '#F4F1FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateChipText: { fontSize: 12, color: Colors.text, fontWeight: '600' },

  /* Actions */
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnConfirm: { backgroundColor: '#059669' },
  actionBtnDone: { backgroundColor: Colors.primary },
  actionBtnCancel: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
