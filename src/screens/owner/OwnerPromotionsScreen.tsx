import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import {
  Promotion,
  PromotionPayload,
  PromotionType,
  createPromotion,
  deletePromotion,
  getOwnerPromotions,
  updatePromotion,
} from '../../api/promotions';
import { getServices, Service } from '../../api/services';

interface Props {
  navigation: any;
}

const TYPE_OPTIONS: { key: PromotionType; label: string; helper: string }[] = [
  { key: 'percentage', label: 'Percentage Off', helper: 'Example: 20 means 20% off' },
  { key: 'flat', label: 'Flat Discount', helper: 'Example: 200 means ₹200 off' },
  { key: 'gift_voucher', label: 'Gift Voucher', helper: 'Example: 500 means ₹500 voucher' },
  { key: 'free_service', label: 'Free Service', helper: 'Select eligible services below' },
];

function formatPromotionValue(item: Promotion) {
  if (item.type === 'percentage') return `${item.value}% OFF`;
  if (item.type === 'free_service') return 'FREE SERVICE';
  if (item.type === 'gift_voucher') return `₹${item.value} VOUCHER`;
  return `₹${item.value} OFF`;
}

export default function OwnerPromotionsScreen({ navigation }: Props) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [type, setType] = useState<PromotionType>('percentage');
  const [value, setValue] = useState('');
  const [minBookingAmount, setMinBookingAmount] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [promoData, serviceData] = await Promise.all([getOwnerPromotions(), getServices()]);
      setPromotions(promoData);
      setServices(serviceData);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setEditingPromotion(null);
    setTitle('');
    setCode('');
    setDescription('');
    setTerms('');
    setType('percentage');
    setValue('');
    setMinBookingAmount('');
    setStartsAt('');
    setEndsAt('');
    setUsageLimit('');
    setIsActive(true);
    setSelectedServiceIds([]);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setTitle(promotion.title);
    setCode(promotion.code);
    setDescription(promotion.description || '');
    setTerms(promotion.terms || '');
    setType(promotion.type);
    setValue(String(promotion.value || ''));
    setMinBookingAmount(String(promotion.minBookingAmount || ''));
    setStartsAt(promotion.startsAt ? String(promotion.startsAt).slice(0, 10) : '');
    setEndsAt(promotion.endsAt ? String(promotion.endsAt).slice(0, 10) : '');
    setUsageLimit(promotion.usageLimit ? String(promotion.usageLimit) : '');
    setIsActive(Boolean(promotion.isActive));
    setSelectedServiceIds((promotion.appliesToServiceIds || []).map(service => service._id));
    setShowModal(true);
  };

  const helperText = useMemo(() => {
    return TYPE_OPTIONS.find(option => option.key === type)?.helper || '';
  }, [type]);

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(item => item !== serviceId)
        : [...prev, serviceId],
    );
  };

  const savePromotion = async () => {
    if (!title.trim() || !code.trim()) {
      Alert.alert('Error', 'Title and code are required');
      return;
    }

    if (type !== 'free_service' && !value.trim()) {
      Alert.alert('Error', 'Value is required for this promotion type');
      return;
    }

    const payload: PromotionPayload = {
      title: title.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim() || undefined,
      terms: terms.trim() || undefined,
      type,
      value: type === 'free_service' ? 0 : Number(value || 0),
      minBookingAmount: Number(minBookingAmount || 0),
      startsAt: startsAt || undefined,
      endsAt: endsAt || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      appliesToServiceIds: selectedServiceIds,
      isActive,
    };

    setSaving(true);
    try {
      if (editingPromotion) {
        await updatePromotion(editingPromotion._id, payload);
      } else {
        await createPromotion(payload);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (promotion: Promotion) => {
    Alert.alert('Delete Promotion', `Delete "${promotion.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePromotion(promotion._id);
            setPromotions(prev => prev.filter(item => item._id !== promotion._id));
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete promotion');
          }
        },
      },
    ]);
  };

  const toggleActive = async (promotion: Promotion) => {
    try {
      const updated = await updatePromotion(promotion._id, { isActive: !promotion.isActive });
      setPromotions(prev => prev.map(item => (item._id === promotion._id ? updated : item)));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update promotion');
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Promotions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎁</Text>
              <Text style={styles.emptyTitle}>No promotions yet</Text>
              <Text style={styles.emptySubtitle}>Create offers customers can use on the user app.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{formatPromotionValue(item)}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleActive(item)}>
                  <Text style={[styles.toggleText, item.isActive ? styles.activeText : styles.inactiveText]}>
                    {item.isActive ? 'Active' : 'Paused'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardCode}>Code: {item.code}</Text>
              {!!item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
              <Text style={styles.cardMeta}>
                Minimum booking: ₹{item.minBookingAmount || 0}
                {item.usageLimit ? ` • Limit ${item.usageCount || 0}/${item.usageLimit}` : ''}
              </Text>
              {(item.appliesToServiceIds || []).length > 0 && (
                <Text style={styles.cardMeta}>
                  Applies to: {(item.appliesToServiceIds || []).map(service => service.name).join(', ')}
                </Text>
              )}
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
                  <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingPromotion ? 'Edit Promotion' : 'Create Promotion'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Weekend Special" placeholderTextColor={Colors.grey} />

              <Text style={styles.inputLabel}>Code *</Text>
              <TextInput style={styles.input} value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="SAVE20" placeholderTextColor={Colors.grey} />

              <Text style={styles.inputLabel}>Promotion Type</Text>
              <View style={styles.typeGrid}>
                {TYPE_OPTIONS.map(option => {
                  const selected = option.key === type;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.typeChip, selected && styles.typeChipActive]}
                      onPress={() => setType(option.key)}>
                      <Text style={[styles.typeChipText, selected && styles.typeChipTextActive]}>{option.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.helperText}>{helperText}</Text>

              {type !== 'free_service' && (
                <>
                  <Text style={styles.inputLabel}>Value</Text>
                  <TextInput style={styles.input} value={value} onChangeText={setValue} keyboardType="numeric" placeholder="20" placeholderTextColor={Colors.grey} />
                </>
              )}

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Explain the offer" placeholderTextColor={Colors.grey} />

              <Text style={styles.inputLabel}>Terms</Text>
              <TextInput style={[styles.input, styles.textarea]} value={terms} onChangeText={setTerms} multiline placeholder="Optional terms and conditions" placeholderTextColor={Colors.grey} />

              <Text style={styles.inputLabel}>Minimum Booking Amount</Text>
              <TextInput style={styles.input} value={minBookingAmount} onChangeText={setMinBookingAmount} keyboardType="numeric" placeholder="0" placeholderTextColor={Colors.grey} />

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.inputLabel}>Starts On</Text>
                  <TextInput style={styles.input} value={startsAt} onChangeText={setStartsAt} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.grey} />
                </View>
                <View style={styles.half}>
                  <Text style={styles.inputLabel}>Ends On</Text>
                  <TextInput style={styles.input} value={endsAt} onChangeText={setEndsAt} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.grey} />
                </View>
              </View>

              <Text style={styles.inputLabel}>Usage Limit</Text>
              <TextInput style={styles.input} value={usageLimit} onChangeText={setUsageLimit} keyboardType="numeric" placeholder="Optional" placeholderTextColor={Colors.grey} />

              <Text style={styles.inputLabel}>Eligible Services</Text>
              <View style={styles.serviceWrap}>
                {services.map(service => {
                  const selected = selectedServiceIds.includes(service._id);
                  return (
                    <TouchableOpacity
                      key={service._id}
                      style={[styles.serviceChip, selected && styles.serviceChipActive]}
                      onPress={() => toggleService(service._id)}>
                      <Text style={[styles.serviceChipText, selected && styles.serviceChipTextActive]}>{service.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.statusRow} onPress={() => setIsActive(prev => !prev)}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={[styles.statusPill, isActive ? styles.statusPillActive : styles.statusPillInactive]}>
                  <Text style={styles.statusPillText}>{isActive ? 'Active' : 'Paused'}</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={savePromotion} disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveText}>{editingPromotion ? 'Update' : 'Create'}</Text>}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, color: Colors.text },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: Colors.white, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 6, textAlign: 'center', paddingHorizontal: 36 },
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { backgroundColor: '#F4EFFF', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  toggleText: { fontSize: 12, fontWeight: '700' },
  activeText: { color: Colors.green },
  inactiveText: { color: Colors.red },
  cardTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  cardCode: { fontSize: 12, color: Colors.primary, fontWeight: '700', marginTop: 4 },
  cardDescription: { fontSize: 13, color: Colors.textSecondary, marginTop: 6 },
  cardMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: { flex: 1, borderRadius: 12, backgroundColor: '#F5F0FF', alignItems: 'center', paddingVertical: 11 },
  actionBtnText: { color: Colors.primary, fontWeight: '700' },
  deleteBtn: { backgroundColor: '#FEE2E2' },
  deleteBtnText: { color: '#DC2626' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '88%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: Colors.text, marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.greyBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: Colors.text, fontSize: 14 },
  textarea: { minHeight: 82, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { borderWidth: 1, borderColor: Colors.greyBorder, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.white },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: '#F5F0FF' },
  typeChipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  typeChipTextActive: { color: Colors.primary },
  helperText: { fontSize: 12, color: Colors.textSecondary, marginTop: 8 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  serviceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: { borderWidth: 1, borderColor: Colors.greyBorder, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  serviceChipActive: { borderColor: Colors.primary, backgroundColor: '#F5F0FF' },
  serviceChipText: { fontSize: 12, color: Colors.textSecondary },
  serviceChipTextActive: { color: Colors.primary, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingVertical: 8 },
  statusLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  statusPill: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  statusPillActive: { backgroundColor: '#DCFCE7' },
  statusPillInactive: { backgroundColor: '#FEE2E2' },
  statusPillText: { fontSize: 12, fontWeight: '700', color: Colors.text },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: Colors.greyBorder, borderRadius: 12, alignItems: 'center', paddingVertical: 13 },
  cancelText: { color: Colors.textSecondary, fontWeight: '700' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 13 },
  saveText: { color: Colors.white, fontWeight: '700' },
});
