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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getStaff, addStaff, updateStaff, deleteStaff, StaffMember } from '../../api/staff';

interface Props {
  navigation: any;
}

export default function OwnerStaffScreen({ navigation }: Props) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Add staff form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [isActive, setIsActive] = useState(true);

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

  const resetForm = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setSpecialization('');
    setIsActive(true);
    setShowPassword(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name || '');
    setEmail(member.email || '');
    setPassword('');
    setPhone(member.phone || '');
    setSpecialization(member.specialization || '');
    setIsActive(member.isActive ?? true);
    setShowAddModal(true);
  };

  const handleAddStaff = async () => {
    if (!name.trim() || !specialization.trim() || !email.trim()) {
      Alert.alert('Error', 'Name, email and specialization are required');
      return;
    }

    if (!editingStaff && password.trim().length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff._id, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          specialization: specialization.trim(),
          isActive,
          ...(password.trim() ? { password: password.trim() } : {}),
        });
      } else {
        await addStaff({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          phone: phone.trim(),
          specialization: specialization.trim(),
          isActive,
        });
      }
      setShowAddModal(false);
      resetForm();
      await fetchStaff();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save staff');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteStaff = () => {
    if (!editingStaff) {
      return;
    }

    Alert.alert(
      'Remove Staff Member',
      `Are you sure you want to remove ${editingStaff.name}? This will also remove their login access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteStaff(editingStaff._id);
              setShowAddModal(false);
              resetForm();
              await fetchStaff();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove staff');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const COLORS = ['#6C3FC5', '#0EA5E9', '#10B981', '#F97316', '#EF4444'];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Staff ({staff.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
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
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal}>
                <Text style={styles.emptyAddText}>Add First Staff Member</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.86} onPress={() => openEditModal(item)}>
              <View style={[styles.avatar, { backgroundColor: COLORS[index % COLORS.length] }]}>
                <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.staffName}>{item.name}</Text>
                <Text style={styles.specialization}>✂️ {item.specialization}</Text>
                {!!item.email && <Text style={styles.email}>✉️ {item.email}</Text>}
                {item.phone && <Text style={styles.phone}>📞 {item.phone}</Text>}
              </View>
              <View style={[styles.activeBadge, !(item.isActive ?? true) && styles.inactiveBadge]}>
                <Text style={[styles.activeText, !(item.isActive ?? true) && styles.inactiveText]}>
                  {item.isActive ?? true ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Add Staff Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingStaff ? 'Manage Staff Member' : 'Add Staff Member'}</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor={Colors.grey}
                value={name}
                onChangeText={setName}
              />
              <Text style={styles.inputLabel}>Login Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. priya@salon.com"
                placeholderTextColor={Colors.grey}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Text style={styles.inputLabel}>{editingStaff ? 'Reset Password' : 'Temporary Password *'}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder={editingStaff ? 'Leave blank to keep current password' : 'At least 6 characters'}
                  placeholderTextColor={Colors.grey}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(current => !current)}>
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                </TouchableOpacity>
              </View>
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
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Login Access</Text>
                  <Text style={styles.switchHint}>
                    {isActive ? 'Staff can log in and manage assigned bookings.' : 'Staff login is blocked until you reactivate it.'}
                  </Text>
                </View>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: Colors.greyBorder, true: Colors.primaryLight }}
                  thumbColor={isActive ? Colors.primary : Colors.grey}
                />
              </View>
            </ScrollView>
            {editingStaff ? (
              <TouchableOpacity
                style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
                onPress={confirmDeleteStaff}
                disabled={saving || deleting}>
                {deleting ? (
                  <ActivityIndicator color="#DC2626" size="small" />
                ) : (
                  <Text style={styles.deleteBtnText}>Remove Staff</Text>
                )}
              </TouchableOpacity>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowAddModal(false); resetForm(); }} disabled={saving || deleting}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (saving || deleting) && { opacity: 0.6 }]}
                onPress={handleAddStaff}
                disabled={saving || deleting}>
                {saving ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveBtnText}>{editingStaff ? 'Save Changes' : 'Create Staff Login'}</Text>}
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
  email: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  phone: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  activeBadge: { backgroundColor: '#10B98120', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  activeText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  inactiveBadge: { backgroundColor: '#FEE2E2' },
  inactiveText: { color: '#DC2626' },
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  switchHint: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.text,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  passwordInput: {
    flex: 1,
  },
  eyeBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  eyeIcon: {
    fontSize: 18,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.greyBorder, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  cancelText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
