import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { getBookings, updateBookingStatus, Booking } from '../../api/bookings';

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.primary,
  confirmed: Colors.primary,
  completed: Colors.green,
  cancelled: Colors.red,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Upcoming',
  confirmed: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function getServiceName(b: Booking): string {
  if (Array.isArray(b.serviceIds) && b.serviceIds.length > 0 && typeof b.serviceIds[0] === 'object') {
    return b.serviceIds.map(service => typeof service === 'object' ? service.name : 'Service').join(', ');
  }
  if (typeof b.serviceId === 'object') return b.serviceId.name;
  return 'Service';
}

function getServicePrice(b: Booking): string {
  if (typeof b.totalAmount === 'number') return `₹${b.totalAmount}`;
  if (typeof b.serviceId === 'object') return `₹${b.serviceId.price}`;
  return '';
}

function getStaffName(b: Booking): string {
  if (typeof b.staffId === 'object' && b.staffId) return b.staffId.name;
  return '';
}

export default function BookingScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'];

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getBookings();
      setBookings(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings]),
  );

  const handleCancel = async (id: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateBookingStatus(id, 'cancelled');
            setBookings(prev => prev.map(item => item._id === id ? { ...item, status: 'cancelled' } : item));
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const filtered = bookings.filter(b => {
    if (activeTab === 'All') return true;
    const label = STATUS_LABELS[b.status] || b.status;
    return label === activeTab;
  });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>
      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchBookings();
              }}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
          renderItem={({ item }) => {
            const statusLabel = STATUS_LABELS[item.status] || item.status;
            const statusColor = STATUS_COLORS[item.status] || Colors.textSecondary;
            const bookingDate = item.bookingDate
              ? new Date(item.bookingDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '';
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardEmoji}><Text style={{ fontSize: 28 }}>💇</Text></View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardSalon}>{item.salonName || 'Salon'}</Text>
                    <Text style={styles.cardService}>{getServiceName(item)}</Text>
                    <Text style={styles.cardDateTime}>📅 {bookingDate} · ⏰ {item.timeSlot}</Text>
                    {!!getStaffName(item) && <Text style={styles.cardDateTime}>👤 {getStaffName(item)}</Text>}
                    {!!item.promotionCode && <Text style={styles.cardDateTime}>🎁 Offer used: {item.promotionCode}</Text>}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.price}>{getServicePrice(item)}</Text>
                  {(item.status === 'pending' || item.status === 'confirmed') && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item._id)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === 'completed' && (
                    <TouchableOpacity style={styles.rebookBtn}>
                      <Text style={styles.rebookText}>Rebook</Text>
                    </TouchableOpacity>
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
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  tabRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 12, gap: 6 },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, color: Colors.textSecondary },
  tabTextActive: { color: Colors.white, fontWeight: '700' },
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: { flexDirection: 'row', padding: 12, alignItems: 'flex-start', gap: 10 },
  cardEmoji: {
    width: 54,
    height: 54,
    backgroundColor: Colors.greyLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardSalon: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardService: { fontSize: 12, color: Colors.textSecondary, marginVertical: 2 },
  cardDateTime: { fontSize: 11, color: Colors.textSecondary },
  statusBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.greyLight,
  },
  price: { fontSize: 15, fontWeight: '800', color: Colors.text },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: Colors.red,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  cancelText: { color: Colors.red, fontSize: 12, fontWeight: '700' },
  rebookBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  rebookText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, marginTop: 40, fontSize: 14 },
});
