import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { DashboardStats, getDashboardStats } from '../../api/dashboard';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function StaffDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load staff dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const firstName = (user?.name || 'Staff').split(' ')[0];
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchStats();
            }}
            colors={[Colors.primary]}
          />
        }>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.name}>{firstName}</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('StaffNotifications')}>
            <Text style={styles.headerBtnIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loaderText}>Loading your schedule…</Text>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroLabel}>Your assigned bookings</Text>
                <Text style={styles.heroValue}>{stats.totalBookings ?? 0}</Text>
                <Text style={styles.heroSub}>Today: {stats.todayBookings ?? 0}</Text>
              </View>
              <Text style={styles.heroEmoji}>📋</Text>
            </View>

            <Text style={styles.sectionTitle}>Today at a glance</Text>
            <View style={styles.grid}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>⏳</Text>
                <Text style={styles.statValue}>{stats.pendingBookings ?? 0}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>✅</Text>
                <Text style={styles.statValue}>{stats.confirmedBookings ?? 0}</Text>
                <Text style={styles.statLabel}>Confirmed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🎉</Text>
                <Text style={styles.statValue}>{stats.completedBookings ?? 0}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>✂️</Text>
                <Text style={styles.statValue}>{stats.totalServices ?? 0}</Text>
                <Text style={styles.statLabel}>Services</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Quick actions</Text>
            <View style={styles.actionsGrid}>
              {[
                { icon: '📋', label: 'My Bookings', sub: 'Manage your appointments', screen: 'StaffBookingsTab' },
                { icon: '✂️', label: 'Services', sub: 'Manage salon services', screen: 'StaffServicesTab' },
                { icon: '🔔', label: 'Notifications', sub: 'Recent updates', screen: 'StaffNotifications' },
                { icon: '👤', label: 'Profile', sub: 'Your account', screen: 'StaffProfileTab' },
              ].map(item => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(item.screen)}>
                  <Text style={styles.actionIcon}>{item.icon}</Text>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                  <Text style={styles.actionSub}>{item.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F1FF' },
  scrollContent: { paddingBottom: 30 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  greeting: { fontSize: 13, color: Colors.textSecondary },
  name: { fontSize: 26, fontWeight: '800', color: Colors.text, marginTop: 2 },
  date: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnIcon: { fontSize: 20 },
  loaderWrap: { alignItems: 'center', marginTop: 90, gap: 12 },
  loaderText: { color: Colors.textSecondary, fontSize: 14 },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.76)' },
  heroValue: { fontSize: 40, fontWeight: '900', color: Colors.white, marginTop: 2 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.76)', marginTop: 4 },
  heroEmoji: { fontSize: 52 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginHorizontal: 20, marginTop: 22, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  statCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 26, fontWeight: '800', color: Colors.text, marginTop: 10 },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  actionsGrid: { paddingHorizontal: 16, gap: 10 },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
  },
  actionIcon: { fontSize: 24, marginBottom: 10 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  actionSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
});