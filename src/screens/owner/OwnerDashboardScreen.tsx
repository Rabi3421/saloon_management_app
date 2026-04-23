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

const StatCard = ({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string | number;
  color: string;
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value ?? 0}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.ownerName}>{user?.name || 'Owner'}</Text>
            <Text style={styles.todayDate}>{today}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('OwnerNotifications')}>
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />
        ) : (
          <>
            {/* Stats Grid */}
            <Text style={styles.sectionTitle}>Today's Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard
                emoji="📅"
                label="Today's Bookings"
                value={stats.todayBookings ?? 0}
                color={Colors.primary}
              />
              <StatCard
                emoji="⏳"
                label="Pending"
                value={stats.pendingBookings ?? 0}
                color="#F97316"
              />
              <StatCard
                emoji="✅"
                label="Confirmed"
                value={stats.confirmedBookings ?? 0}
                color="#10B981"
              />
              <StatCard
                emoji="💰"
                label="Today's Revenue"
                value={`₹${stats.todayRevenue ?? 0}`}
                color="#8B5CF6"
              />
            </View>

            {/* All-time stats */}
            <Text style={styles.sectionTitle}>All Time</Text>
            <View style={styles.statsRow}>
              <View style={styles.bigStatCard}>
                <Text style={styles.bigStatValue}>{stats.totalBookings ?? 0}</Text>
                <Text style={styles.bigStatLabel}>Total Bookings</Text>
              </View>
              <View style={styles.bigStatCard}>
                <Text style={styles.bigStatValue}>₹{stats.totalRevenue ?? 0}</Text>
                <Text style={styles.bigStatLabel}>Total Revenue</Text>
              </View>
              <View style={styles.bigStatCard}>
                <Text style={styles.bigStatValue}>{stats.totalCustomers ?? 0}</Text>
                <Text style={styles.bigStatLabel}>Customers</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: '📋', label: 'Bookings', screen: 'OwnerBookingsTab' },
                { icon: '👥', label: 'Staff', screen: 'OwnerStaffTab' },
                { icon: '✂️', label: 'Services', screen: 'OwnerServicesTab' },
                { icon: '💬', label: 'Messages', screen: 'OwnerMessages' },
              ].map(action => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(action.screen)}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recent Bookings */}
            {stats.recentBookings && stats.recentBookings.length > 0 && (
              <>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Recent Bookings</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('OwnerBookingsTab')}>
                    <Text style={styles.seeAll}>See All</Text>
                  </TouchableOpacity>
                </View>
                {stats.recentBookings.slice(0, 5).map((b: any) => (
                  <View key={b._id} style={styles.bookingRow}>
                    <View style={styles.bookingAvatar}>
                      <Text style={styles.bookingAvatarText}>
                        {(b.userId?.name || b.customerName || 'C')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.bookingInfo}>
                      <Text style={styles.bookingCustomer}>
                        {b.userId?.name || b.customerName || 'Customer'}
                      </Text>
                      <Text style={styles.bookingMeta}>
                        {b.serviceId?.name || 'Service'} • {b.timeSlot}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[b.status] + '20' }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[b.status] }]}>
                        {b.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F97316',
  confirmed: '#10B981',
  completed: '#6366F1',
  cancelled: '#EF4444',
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  greeting: { fontSize: 13, color: Colors.textSecondary },
  ownerName: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 2 },
  todayDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  notifIcon: { fontSize: 18 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  seeAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statEmoji: { fontSize: 22, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 10 },
  bigStatCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  bigStatValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  bigStatLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: Colors.text },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  bookingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookingAvatarText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  bookingInfo: { flex: 1 },
  bookingCustomer: { fontSize: 13, fontWeight: '700', color: Colors.text },
  bookingMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
});
