import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

const PAYMENT_METHODS = [
  { id: '1', type: 'visa', last4: '3456', name: 'Mastercard', expiry: '12/26', color: '#FF6B35' },
  { id: '2', type: 'mastercard', last4: '8901', name: 'Visa Card', expiry: '09/27', color: '#6C3FC5' },
  { id: '3', type: 'cash', last4: '', name: 'Cash', expiry: '', color: '#10B981' },
];

interface Props {
  navigation: any;
  route: any;
}

export default function PaymentScreen({ navigation, route }: Props) {
  const { total, salon, date, time } = route.params || {};
  const [selectedMethod, setSelectedMethod] = useState('1');
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePay = () => {
    setShowSuccess(true);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>${total || 55}</Text>
          <Text style={styles.amountSalon}>{salon?.name || 'Serenity Salon'}</Text>
          <Text style={styles.amountDate}>{date} · {time}</Text>
        </View>

        {/* Payment methods */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {PAYMENT_METHODS.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, selectedMethod === method.id && styles.methodCardSelected]}
            onPress={() => setSelectedMethod(method.id)}>
            <View style={[styles.cardIcon, { backgroundColor: method.color }]}>
              <Text style={styles.cardIconText}>
                {method.type === 'cash' ? '💵' : method.type === 'visa' ? '💳' : '🏧'}
              </Text>
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              {method.last4 ? (
                <Text style={styles.methodNumber}>**** **** **** {method.last4}</Text>
              ) : (
                <Text style={styles.methodNumber}>Pay at the counter</Text>
              )}
            </View>
            <View style={[styles.radio, selectedMethod === method.id && styles.radioSelected]}>
              {selectedMethod === method.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Add new card */}
        <TouchableOpacity
          style={styles.addCardBtn}
          onPress={() => navigation.navigate('AddCard')}>
          <Text style={styles.addCardIcon}>＋</Text>
          <Text style={styles.addCardText}>Add New Card</Text>
        </TouchableOpacity>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Services</Text>
            <Text style={styles.summaryValue}>${(total || 55) - 5}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>$5</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total</Text>
            <Text style={styles.summaryTotalValue}>${total || 55}</Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
          <Text style={styles.payBtnText}>Pay ${total || 55}</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>✅</Text>
            </View>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successDesc}>
              Your appointment at {salon?.name || 'Serenity Salon'} has been successfully booked.
            </Text>
            <View style={styles.successDetails}>
              <Text style={styles.successDetail}>📅 {date}</Text>
              <Text style={styles.successDetail}>⏰ {time}</Text>
              <Text style={styles.successDetail}>💰 ${total}</Text>
            </View>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setShowSuccess(false);
                navigation.navigate('MainApp');
              }}>
              <Text style={styles.successBtnText}>View My Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.successBtnOutline}
              onPress={() => {
                setShowSuccess(false);
                navigation.navigate('MainApp');
              }}>
              <Text style={styles.successBtnOutlineText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  amountCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  amountValue: { fontSize: 40, fontWeight: '800', color: Colors.white, marginBottom: 8 },
  amountSalon: { fontSize: 15, fontWeight: '600', color: Colors.white, marginBottom: 4 },
  amountDate: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.greyBorder,
    gap: 12,
  },
  methodCardSelected: { borderColor: Colors.primary, backgroundColor: '#F5F0FF' },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: { fontSize: 22 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  methodNumber: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.greyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 8,
  },
  addCardIcon: { fontSize: 18, color: Colors.primary },
  addCardText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary },
  summaryValue: { fontSize: 13, color: Colors.text },
  summaryDivider: { height: 1, backgroundColor: Colors.greyBorder, marginBottom: 10 },
  summaryTotal: { fontSize: 15, fontWeight: '700', color: Colors.text },
  summaryTotalValue: { fontSize: 17, fontWeight: '800', color: Colors.primary },
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
  payBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successModal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successEmoji: { fontSize: 44 },
  successTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  successDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 18 },
  successDetails: { backgroundColor: Colors.greyLight, borderRadius: 12, padding: 14, width: '100%', gap: 8, marginBottom: 20 },
  successDetail: { fontSize: 14, color: Colors.text },
  successBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  successBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  successBtnOutline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  successBtnOutlineText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
