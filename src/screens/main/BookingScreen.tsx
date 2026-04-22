import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

const BOOKINGS = [
  { id: '1', salon: 'Serenity Salon', service: 'Hair Cut - Short', date: 'Mon, Apr 28, 2026', time: '10:00 AM', status: 'Upcoming', price: '$30' },
  { id: '2', salon: 'Uptown Hair', service: 'Beard Trim', date: 'Sat, Apr 19, 2026', time: '2:00 PM', status: 'Completed', price: '$20' },
  { id: '3', salon: 'Curls & More', service: 'Hair Color - Highlights', date: 'Fri, Apr 11, 2026', time: '11:00 AM', status: 'Cancelled', price: '$120' },
];

const STATUS_COLORS: Record<string, string> = {
  Upcoming: Colors.primary,
  Completed: Colors.green,
  Cancelled: Colors.red,
};

export default function BookingScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled'];
  const filtered = activeTab === 'All' ? BOOKINGS : BOOKINGS.filter(b => b.status === activeTab);

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
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardEmoji}><Text style={{ fontSize: 28 }}>💇</Text></View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardSalon}>{item.salon}</Text>
                <Text style={styles.cardService}>{item.service}</Text>
                <Text style={styles.cardDateTime}>📅 {item.date} · ⏰ {item.time}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.price}>{item.price}</Text>
              {item.status === 'Upcoming' && (
                <TouchableOpacity style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              )}
              {item.status === 'Completed' && (
                <TouchableOpacity style={styles.rebookBtn}>
                  <Text style={styles.rebookText}>Rebook</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
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
});
