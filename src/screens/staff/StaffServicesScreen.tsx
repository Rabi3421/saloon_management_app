import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { createService, deleteService, getServices, updateService } from '../../api/services';

interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  category?: string;
  description?: string;
}

export default function StaffServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      setServices(await getServices());
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load services');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const resetForm = () => {
    setEditingService(null);
    setName('');
    setPrice('');
    setDuration('');
    setCategory('');
    setDescription('');
  };

  const openAdd = () => {
    resetForm();
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

  const saveService = async () => {
    if (!name.trim() || !price.trim() || !duration.trim() || !category.trim()) {
      Alert.alert('Error', 'Name, price, duration and category are required');
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
      resetForm();
      await fetchServices();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const removeService = (service: Service) => {
    Alert.alert('Delete Service', `Delete "${service.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteService(service._id);
            setServices(prev => prev.filter(item => item._id !== service._id));
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete service');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Services</Text>
          <Text style={styles.subtitle}>Manage salon services available for bookings</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading services…</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchServices(); }} colors={[Colors.primary]} />}
          ListEmptyComponent={<Text style={styles.empty}>No services created yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceMeta}>⏱️ {item.duration} min • {item.category || 'General'}</Text>
                {!!item.description && <Text style={styles.description}>{item.description}</Text>}
              </View>
              <View style={styles.rightSide}>
                <Text style={styles.price}>₹{item.price}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEdit(item)}><Text style={styles.actionIcon}>✏️</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => removeService(item)}><Text style={styles.actionIcon}>🗑️</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add Service'}</Text>
            <ScrollView>
              <Text style={styles.inputLabel}>Service Name *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Haircut" placeholderTextColor={Colors.grey} />
              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.inputLabel}>Price *</Text>
                  <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="299" placeholderTextColor={Colors.grey} />
                </View>
                <View style={styles.half}>
                  <Text style={styles.inputLabel}>Duration *</Text>
                  <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" placeholder="30" placeholderTextColor={Colors.grey} />
                </View>
              </View>
              <Text style={styles.inputLabel}>Category *</Text>
              <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Hair" placeholderTextColor={Colors.grey} />
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline placeholder="Short description" placeholderTextColor={Colors.grey} />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setShowModal(false); resetForm(); }}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={saveService} disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.primaryBtnText}>{editingService ? 'Save' : 'Create'}</Text>}
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
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, maxWidth: 210 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9 },
  addBtnText: { color: Colors.white, fontWeight: '700' },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: 14, color: Colors.textSecondary },
  list: { padding: 16, paddingBottom: 30 },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 60 },
  card: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 12 },
  cardInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  serviceMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  description: { fontSize: 12, color: Colors.textSecondary, marginTop: 6 },
  rightSide: { alignItems: 'flex-end', marginLeft: 12 },
  price: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionIcon: { fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: Colors.greyBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  secondaryBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.greyBorder, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  secondaryBtnText: { color: Colors.textSecondary, fontWeight: '600' },
  primaryBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  primaryBtnText: { color: Colors.white, fontWeight: '700' },
});