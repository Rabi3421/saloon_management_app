import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getDashboardStats, DashboardStats } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F97316',
  confirmed: '#10B981',
  completed: '#6366F1',
  cancelled: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Done',
  cancelled: 'Cancelled',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function OwnerDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const firstName = (user?.name || 'Owner').split(' ')[0];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.ownerName}>{firstName}</Text>
            <Text style={styles.todayDate}>{today}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('OwnerMessages')}
              activeOpacity={0.8}>
              <Text style={styles.notifIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('OwnerNotifications')}
              activeOpacity={0.8}>
              <Text style={styles.notifIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loaderText}>Loading your dashboard…</Text>
          </View>
        ) : (
          <>
            {/* ── Revenue Hero Card ── */}
            <View style={styles.heroCard}>
              <View style={styles.heroLeft}>
                <Text style={styles.heroLabel}>Today's Earnings</Text>
                <Text style={styles.heroValue}>₹{stats.todayRevenue ?? 0}</Text>
                <Text style={styles.heroSub}>
                  Total earned: ₹{stats.totalRevenue ?? 0}
                </Text>
              </View>
              <View style={styles.heroRight}>
                <Text style={styles.heroEmoji}>💰</Text>
              </View>
            </View>

            {/* ── Today's Stats ── */}
            <Text style={styles.sectionTitle}>Today</Text>
            <View style={styles.todayGrid}>
              {/* Bookings */}
              <View style={[styles.todayCard, { borderTopColor: Colors.primary }]}>
                <Text style={styles.todayCardEmoji}>📅</Text>
                <Text style={styles.todayCardValue}>{stats.todayBookings ?? 0}</Text>
                <Text style={styles.todayCardLabel}>Bookings</Text>
              </View>
              {/* Pending */}
              <View style={[styles.todayCard, { borderTopColor: '#F97316' }]}>
                <Text style={styles.todayCardEmoji}>⏳</Text>
                <Text style={[styles.todayCardValue, { color: '#F97316' }]}>
                  {stats.pendingBookings ?? 0}
                </Text>
                <Text style={styles.todayCardLabel}>Pending</Text>
              </View>
              {/* Confirmed */}
              <View style={[styles.todayCard, { borderTopColor: '#10B981' }]}>
                <Text style={styles.todayCardEmoji}>✅</Text>
                <Text style={[styles.todayCardValue, { color: '#10B981' }]}>
                  {stats.confirmedBookings ?? 0}
                </Text>
                <Text style={styles.todayCardLabel}>Confirmed</Text>
              </View>
            </View>

            {/* ── All-Time Stats ── */}
            <Text style={styles.sectionTitle}>All Time</Text>
            <View style={styles.allTimeRow}>
              <View style={styles.allTimeCard}>
                <Text style={styles.allTimeValue}>{stats.totalBookings ?? 0}</Text>
                <Text style={styles.allTimeLabel}>Bookings</Text>
              </View>
              <View style={[styles.allTimeCard, styles.allTimeCardMiddle]}>
                <Text style={[styles.allTimeValue, { color: Colors.primary }]}>
                  {stats.totalCustomers ?? 0}
                </Text>
                <Text style={styles.allTimeLabel}>Customers</Text>
              </View>
              <View style={styles.allTimeCard}>
                <Text style={styles.allTimeValue}>₹{stats.totalRevenue ?? 0}</Text>
                <Text style={styles.allTimeLabel}>Revenue</Text>
              </View>
            </View>

            {/* ── Quick Actions ── */}
            <Text style={styles.sectionTitle}>Manage</Text>
            <View style={styles.actionsGrid}>
              {[
                { emoji: '📋', label: 'Bookings', sub: 'View & manage', screen: 'OwnerBookingsTab', bg: '#EDE9FF' },
                { emoji: '👥', label: 'Staff', sub: 'Your team', screen: 'OwnerStaffTab', bg: '#E0F2FE' },
                { emoji: '✂️', label: 'Services', sub: 'Prices & offers', screen: 'OwnerServicesTab', bg: '#FEF3C7' },
                { emoji: '🎁', label: 'Promotions', sub: 'Discounts & vouchers', screen: 'OwnerPromotions', bg: '#FCE7F3' },
                { emoji: '💬', label: 'Messages', sub: 'Chat with customers', screen: 'OwnerMessages', bg: '#DCFCE7' },
              ].map(action => (
                <TouchableOpacity
                  key={action.label}
                  style={[styles.actionCard, { backgroundColor: action.bg }]}
                  onPress={() => navigation.navigate(action.screen)}
                  activeOpacity={0.8}>
                  <Text style={styles.actionEmoji}>{action.emoji}</Text>
                  <View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <Text style={styles.actionSub}>{action.sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Recent Bookings ── */}
            {stats.recentBookings && stats.recentBookings.length > 0 && (
              <>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Recent Bookings</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('OwnerBookingsTab')} activeOpacity={0.7}>
                    <Text style={styles.seeAll}>See All →</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.bookingsList}>
                  {stats.recentBookings.slice(0, 5).map((b: any) => {
                    const statusColor = STATUS_COLORS[b.status] ?? Colors.grey;
                    const name = b.userId?.name || b.customerName || 'Customer';
                    return (
                      <View key={b._id} style={styles.bookingRow}>
                        <View style={[styles.bookingAvatar, { backgroundColor: statusColor + '22' }]}>
                          <Text style={[styles.bookingAvatarText, { color: statusColor }]}>
                            {name[0].toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.bookingInfo}>
                          <Text style={styles.bookingCustomer} numberOfLines={1}>{name}</Text>
                          <Text style={styles.bookingMeta} numberOfLines={1}>
                            {b.serviceId?.name || 'Service'}  •  {b.timeSlot}
                          </Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
                          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                          <Text style={[styles.statusText, { color: statusColor }]}>
                            {STATUS_LABELS[b.status] ?? b.status}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F1FF' },
  scrollContent: { paddingBottom: 32 },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  ownerName: { fontSize: 26, fontWeight: '800', color: Colors.text, marginTop: 2 },
  todayDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  notifBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  notifIcon: { fontSize: 20 },

  /* Loader */
  loaderWrap: { alignItems: 'center', marginTop: 80, gap: 12 },
  loaderText: { fontSize: 14, color: Colors.textSecondary },

  /* Hero Card */
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 4 },
  heroValue: { fontSize: 38, fontWeight: '900', color: Colors.white },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  heroRight: { marginLeft: 16 },
  heroEmoji: { fontSize: 52 },

  /* Section Title */
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '700' },

  /* Today Grid */
  todayGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  todayCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  todayCardEmoji: { fontSize: 24, marginBottom: 8 },
  todayCardValue: { fontSize: 28, fontWeight: '900', color: Colors.text },
  todayCardLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },

  /* All Time */
  allTimeRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  allTimeCard: { flex: 1, paddingVertical: 20, alignItems: 'center' },
  allTimeCardMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F0EEFF',
  },
  allTimeValue: { fontSize: 20, fontWeight: '900', color: Colors.text },
  allTimeLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },

  /* Actions */
  actionsGrid: {
    paddingHorizontal: 16,
    gap: 10,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 16,
  },
  actionEmoji: { fontSize: 30 },
  actionLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  actionSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  /* Bookings List */
  bookingsList: { paddingHorizontal: 16, gap: 10 },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  bookingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookingAvatarText: { fontWeight: '800', fontSize: 17 },
  bookingInfo: { flex: 1 },
  bookingCustomer: { fontSize: 14, fontWeight: '700', color: Colors.text },
  bookingMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
});
