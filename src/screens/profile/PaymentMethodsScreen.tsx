import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

const CARDS = [
  { id: '1', type: 'mastercard', name: 'Jack Rayan', number: '**** **** **** 3456', expiry: '12/26', color: '#FF6B35', isDefault: true },
  { id: '2', type: 'visa', name: 'Jack Rayan', number: '**** **** **** 8901', expiry: '09/27', color: '#6C3FC5', isDefault: false },
];

interface Props {
  navigation: any;
}

export default function PaymentMethodsScreen({ navigation }: Props) {
  const [cards, setCards] = useState(CARDS);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteId) {
      setCards(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={cards}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.sectionLabel}>Saved Cards</Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.creditCard, { backgroundColor: item.color }]}>
            {/* Card chip */}
            <View style={styles.cardChip}>
              <View style={styles.chipInner} />
            </View>
            <Text style={styles.cardNumber}>{item.number}</Text>
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>Card Holder</Text>
                <Text style={styles.cardValue}>{item.name}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Expires</Text>
                <Text style={styles.cardValue}>{item.expiry}</Text>
              </View>
              <Text style={styles.cardBrand}>
                {item.type === 'mastercard' ? '⦿⦿' : 'VISA'}
              </Text>
            </View>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.cardActionBtn}
                onPress={() => navigation.navigate('AddCard', { card: item })}>
                <Text style={styles.cardActionEdit}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardActionBtn}
                onPress={() => setDeleteId(item.id)}>
                <Text style={styles.cardActionDelete}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addCardBtn}
            onPress={() => navigation.navigate('AddCard')}>
            <Text style={styles.addIcon}>＋</Text>
            <Text style={styles.addText}>Add New Card</Text>
          </TouchableOpacity>
        }
      />

      {/* Delete Confirm Modal */}
      <Modal visible={!!deleteId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Are you sure?</Text>
            <Text style={styles.confirmDesc}>
              Are you sure you want to delete this card?
            </Text>
            <TouchableOpacity style={styles.confirmDeleteBtn} onPress={handleDelete}>
              <Text style={styles.confirmDeleteText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmCancelBtn}
              onPress={() => setDeleteId(null)}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
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
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: 12, marginTop: 4 },
  creditCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    minHeight: 180,
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  cardChip: {
    width: 40,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  chipInner: {
    width: 28,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  cardNumber: { fontSize: 18, color: Colors.white, fontWeight: '700', letterSpacing: 2, marginBottom: 16 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  cardValue: { fontSize: 13, color: Colors.white, fontWeight: '600' },
  cardBrand: { fontSize: 16, color: Colors.white, fontWeight: '800' },
  defaultBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  defaultText: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 10,
  },
  cardActionBtn: { flex: 1, alignItems: 'center' },
  cardActionEdit: { color: Colors.white, fontSize: 13 },
  cardActionDelete: { color: Colors.white, fontSize: 13 },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  addIcon: { fontSize: 20, color: Colors.primary },
  addText: { fontSize: 15, color: Colors.primary, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  confirmModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  confirmTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  confirmDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  confirmDeleteBtn: {
    backgroundColor: Colors.red,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  confirmDeleteText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  confirmCancelBtn: {
    borderWidth: 1.5,
    borderColor: Colors.greyBorder,
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  confirmCancelText: { color: Colors.textSecondary, fontSize: 14 },
});
