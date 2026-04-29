import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

interface Props {
  navigation: any;
  route: any;
}

export default function OrderSummaryScreen({ navigation, route }: Props) {
  const { salon, date, time, staff, service, bookingId, booking, promotion } = route.params || {};
  const services = service ? [service] : [];
  const subtotal = booking?.subtotalAmount ?? services.reduce((acc: number, item: any) => acc + Number(item.price || 0), 0);
  const discount = booking?.discountAmount ?? 0;
  const tax = 0;
  const total = booking?.totalAmount ?? Math.max(0, subtotal - discount) + tax;
  const selectedPromotion = promotion || (typeof booking?.promotionId === 'object' ? booking.promotionId : null);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Salon card */}
        <View style={styles.salonCard}>
          <View style={styles.salonEmoji}>
            <Text style={{ fontSize: 32 }}>💇</Text>
          </View>
          <View style={styles.salonInfo}>
            <Text style={styles.salonName}>{salon?.name || 'Serenity Salon'}</Text>
            <Text style={styles.salonAddress} numberOfLines={1}>
              📍 {salon?.address || '8502 Preston Rd. Inglewood, Maine'}
            </Text>
            <Text style={styles.salonRating}>⭐ {salon?.rating || 4.9} ({salon?.reviewCount || 0} Reviews)</Text>
          </View>
        </View>

        {/* Booking info */}
        <View style={styles.infoCard}>
          <Row icon="📅" label="Date" value={date || 'Monday, Apr 28, 2026'} />
          <Row icon="⏰" label="Time" value={time || '10:00 AM'} />
          <Row icon="👤" label="Stylist" value={staff?.name || 'Salon Staff'} />
        </View>

        {/* Services */}
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.servicesCard}>
          {services.map((s: any, i: number) => (
            <View key={i} style={[styles.serviceRow, i < services.length - 1 && styles.serviceRowBorder]}>
              <View>
                <Text style={styles.serviceName}>{s.name}</Text>
                <Text style={styles.serviceDuration}>⏱ {s.duration} min</Text>
              </View>
              <Text style={styles.servicePrice}>₹{s.price}</Text>
            </View>
          ))}
          {services.length === 0 && <Text style={styles.notePlaceholder}>No services selected.</Text>}
        </View>

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{subtotal}</Text>
          </View>
          {selectedPromotion && discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{selectedPromotion.title || 'Offer Applied'}</Text>
              <Text style={[styles.priceValue, { color: Colors.green }]}>-₹{discount}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax</Text>
            <Text style={styles.priceValue}>₹{tax}</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        {/* Note */}
        <Text style={styles.sectionTitle}>Add Note</Text>
        <View style={styles.noteBox}>
          <Text style={styles.notePlaceholder}>Add any special requests or notes...</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.footerLabel}>Total Amount</Text>
            <Text style={styles.footerTotal}>₹{total}</Text>
          </View>
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => navigation.navigate('Payment', { total, salon, date, time, bookingId, service, staff, booking, promotion: selectedPromotion })}>
            <Text style={styles.payBtnText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  scroll: { paddingHorizontal: 16 },
  salonCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  salonEmoji: {
    width: 64,
    height: 64,
    backgroundColor: Colors.greyLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salonInfo: { flex: 1, justifyContent: 'center' },
  salonName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  salonAddress: { fontSize: 11, color: Colors.textSecondary, marginVertical: 3 },
  salonRating: { fontSize: 12, color: Colors.text },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyLight,
  },
  infoIcon: { fontSize: 16, marginRight: 10 },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  infoValue: { fontSize: 13, fontWeight: '600', color: Colors.text },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  servicesCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  serviceRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.greyLight },
  serviceName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  serviceDuration: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  servicePrice: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  priceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: Colors.textSecondary },
  priceValue: { fontSize: 14, color: Colors.text },
  priceDivider: { height: 1, backgroundColor: Colors.greyBorder, marginBottom: 10 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  noteBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    marginBottom: 16,
  },
  notePlaceholder: { color: Colors.grey, fontSize: 13 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.greyBorder,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel: { fontSize: 12, color: Colors.textSecondary },
  footerTotal: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  payBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 13,
    paddingHorizontal: 22,
  },
  payBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
