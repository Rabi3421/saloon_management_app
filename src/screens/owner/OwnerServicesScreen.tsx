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
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../../api/services';

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  category?: string;
  description?: string;
  isActive?: boolean;
}

interface Props {
  navigation: any;
}

export default function OwnerServicesScreen({ navigation }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load services');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openAdd = () => {
    setEditingService(null);
    setName(''); setPrice(''); setDuration(''); setCategory(''); setDescription('');
    setShowModal(true);
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setPrice(String(service.price));
    setDuration(String(service.duration));
    setCategory(service.category || '');
    setDescription(service.description || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !duration.trim()) {
      Alert.alert('Error', 'Name, price and duration are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        price: parseFloat(price),
        duration: parseInt(duration, 10),
        category: category.trim(),
        description: description.trim(),
      };
      if (editingService) {
        await updateService(editingService._id, payload);
      } else {
        await createService(payload);
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (service: Service) => {
    Alert.alert(
      'Delete Service',
      `Delete "${service.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(service._id);
              setServices(prev => prev.filter(s => s._id !== service._id));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete service');
            }
          },
        },
      ],
    );
  };

  const CATEGORY_COLORS: Record<string, string> = {
    Hair: '#8B5CF6',
    Skin: '#F97316',
    Beard: '#0EA5E9',
    Nail: '#EC4899',
    Spa: '#10B981',
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services ({services.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchServices(); }} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✂️</Text>
              <Text style={styles.emptyText}>No services yet</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAdd}>
                <Text style={styles.emptyAddText}>Add First Service</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const catColor = CATEGORY_COLORS[item.category || ''] || Colors.primary;
            return (
              <View style={styles.card}>
                <View style={[styles.categoryDot, { backgroundColor: catColor + '20' }]}>
                  <Text style={{ fontSize: 18 }}>✂️</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <Text style={styles.serviceMeta}>⏱️ {item.duration} min • {item.category || 'General'}</Text>
                  {item.description ? <Text style={styles.serviceDesc} numberOfLines={1}>{item.description}</Text> : null}
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.price}>₹{item.price}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEdit(item)}>
                      <Text style={styles.editIcon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)}>
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add Service'}</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Service Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. Haircut" placeholderTextColor={Colors.grey} value={name} onChangeText={setName} />
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Price (₹) *</Text>
                  <TextInput style={styles.input} placeholder="299" placeholderTextColor={Colors.grey} value={price} onChangeText={setPrice} keyboardType="numeric" />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Duration (min) *</Text>
                  <TextInput style={styles.input} placeholder="30" placeholderTextColor={Colors.grey} value={duration} onChangeText={setDuration} keyboardType="numeric" />
                </View>
              </View>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput style={styles.input} placeholder="e.g. Hair, Skin" placeholderTextColor={Colors.grey} value={category} onChangeText={setCategory} />
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={[styles.input, { height: 80 }]} placeholder="Short description..." placeholderTextColor={Colors.grey} value={description} onChangeText={setDescription} multiline />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.saveBtnText}>{editingService ? 'Update' : 'Add Service'}</Text>}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, marginBottom: 20 },
  emptyAddBtn: { backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  emptyAddText: { color: Colors.white, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  categoryDot: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  serviceMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  serviceDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  rightSide: { alignItems: 'flex-end' },
  price: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  editIcon: { fontSize: 16 },
  deleteIcon: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: Colors.greyBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.greyBorder, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  cancelText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
