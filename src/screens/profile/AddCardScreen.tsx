import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

interface Props {
  navigation: any;
  route: any;
}

export default function AddCardScreen({ navigation, route }: Props) {
  const existing = route?.params?.card;
  const isEdit = !!existing;

  const [cardNumber, setCardNumber] = useState(existing?.number?.replace(/\*/g, '4') || '');
  const [cardName, setCardName] = useState(existing?.name || '');
  const [expiry, setExpiry] = useState(existing?.expiry || '');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(existing?.isDefault || false);

  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Card' : 'Add New Card'}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            <View style={styles.chip}>
              <View style={styles.chipInner} />
            </View>
            <Text style={styles.previewNumber}>
              {cardNumber || '**** **** **** ****'}
            </Text>
            <View style={styles.previewBottom}>
              <View>
                <Text style={styles.previewLabel}>Card Holder</Text>
                <Text style={styles.previewValue}>{cardName || 'Your Name'}</Text>
              </View>
              <View>
                <Text style={styles.previewLabel}>Expires</Text>
                <Text style={styles.previewValue}>{expiry || 'MM/YY'}</Text>
              </View>
              <Text style={styles.brand}>VISA</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={Colors.grey}
              value={cardNumber}
              onChangeText={v => setCardNumber(formatCard(v))}
              keyboardType="numeric"
              maxLength={19}
            />

            <Text style={styles.label}>Card Holder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={Colors.grey}
              value={cardName}
              onChangeText={setCardName}
            />

            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={Colors.grey}
                  value={expiry}
                  onChangeText={v => setExpiry(formatExpiry(v))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={Colors.grey}
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.defaultRow}
              onPress={() => setIsDefault(!isDefault)}>
              <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                {isDefault && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.defaultText}>Set as default payment method</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.saveBtnText}>{isEdit ? 'Update Card' : 'Add Card'}</Text>
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  cardPreview: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    minHeight: 160,
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  chip: {
    width: 40,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipInner: {
    width: 28,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  previewNumber: { fontSize: 18, color: Colors.white, fontWeight: '700', letterSpacing: 2 },
  previewBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  previewLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  previewValue: { fontSize: 13, color: Colors.white, fontWeight: '600' },
  brand: { fontSize: 16, color: Colors.white, fontWeight: '800' },
  form: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.text,
  },
  rowFields: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.greyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  defaultText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
