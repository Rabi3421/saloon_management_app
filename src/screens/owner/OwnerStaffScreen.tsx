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
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getStaff, addStaff, StaffMember } from '../../api/staff';

interface Props {
  navigation: any;
}

export default function OwnerStaffScreen({ navigation }: Props) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add staff form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');

  const fetchStaff = useCallback(async () => {
    try {
      const data = await getStaff();
      setStaff(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleAddStaff = async () => {
    if (!name.trim() || !specialization.trim()) {
      Alert.alert('Error', 'Name and specialization are required');
      return;
    }
    setSaving(true);
    try {
      await addStaff({ name: name.trim(), phone: phone.trim(), specialization: specialization.trim() });
      setShowAddModal(false);
      setName(''); setPhone(''); setSpecialization('');
      fetchStaff();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add staff');
    } finally {
      setSaving(false);
    }
  };

  const COLORS = ['#6C3FC5', '#0EA5E9', '#10B981', '#F97316', '#EF4444'];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staff ({staff.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={staff}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStaff(); }} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No staff members yet</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAddModal(true)}>
                <Text style={styles.emptyAddText}>Add First Staff Member</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <View style={[styles.avatar, { backgroundColor: COLORS[index % COLORS.length] }]}>
                <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.staffName}>{item.name}</Text>
                <Text style={styles.specialization}>✂️ {item.specialization}</Text>
                {item.phone && <Text style={styles.phone}>📞 {item.phone}</Text>}
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Add Staff Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Staff Member</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor={Colors.grey}
                value={name}
                onChangeText={setName}
              />
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 9123456789"
                placeholderTextColor={Colors.grey}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Text style={styles.inputLabel}>Specialization *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Hair Stylist"
                placeholderTextColor={Colors.grey}
                value={specialization}
                onChangeText={setSpecialization}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleAddStaff}
                disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveBtnText}>Add Staff</Text>}
              </TouchableOpacity>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, marginBottom: 20 },
  emptyAddBtn: { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  emptyAddText: { color: Colors.white, fontWeight: '700' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  info: { flex: 1 },
  staffName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  specialization: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  phone: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  activeBadge: { backgroundColor: '#10B98120', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  activeText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.text,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.greyBorder, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  cancelText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
