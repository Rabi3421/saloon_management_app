import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getPublicSalonInfo, getPublicServices, PublicService, SalonInfo } from '../../api/public';

const CATEGORY_META: Record<string, { icon: string; bgColor: string }> = {
  Hair: { icon: '✂️', bgColor: '#FEE2E2' },
  Shave: { icon: '🪒', bgColor: '#EDE9FE' },
  Makeup: { icon: '💄', bgColor: '#FFEDD5' },
  Nail: { icon: '💅', bgColor: '#F3E8FF' },
  Facial: { icon: '🧖', bgColor: '#DCFCE7' },
  Massage: { icon: '💆', bgColor: '#FEF9C3' },
  Spa: { icon: '🛁', bgColor: '#E0F2FE' },
};

interface Props {
  navigation: any;
}

export default function CategoriesScreen({ navigation }: Props) {
  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [salonData, servicesData] = await Promise.all([
          getPublicSalonInfo(),
          getPublicServices(),
        ]);
        setSalon(salonData);
        setServices(servicesData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    return services
      .map((service) => service.category)
      .filter((category) => category && !seen.has(category) && seen.add(category))
      .map((name, index) => ({
        id: String(index),
        name,
        meta: CATEGORY_META[name] ?? { icon: '💈', bgColor: '#F3F4F6' },
      }));
  }, [services]);

  const selectedServices = useMemo(
    () => services.filter((service) => service.category === selectedCategory),
    [selectedCategory, services],
  );

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setShowBottomSheet(true);
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.card}>
        <FlatList
          data={categories}
          numColumns={4}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={<Text style={styles.emptyText}>No categories available yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.catItem} onPress={() => handleCategoryPress(item.name)}>
              <View style={[styles.catCircle, { backgroundColor: item.meta.bgColor }]}>
                <Text style={styles.catEmoji}>{item.meta.icon}</Text>
              </View>
              <Text style={styles.catName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal visible={showBottomSheet} transparent animationType="slide" onRequestClose={() => setShowBottomSheet(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowBottomSheet(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.bsHandle} />
            <View style={styles.bsHeader}>
              <View>
                <Text style={styles.bsTitle}>{selectedCategory}</Text>
                <Text style={styles.bsSubtitle}>{selectedServices.length} service(s) available</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBottomSheet(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            {salon && selectedServices.length > 0 ? (
              <TouchableOpacity
                style={styles.salonRow}
                onPress={() => {
                  setShowBottomSheet(false);
                  navigation.navigate('SalonList', { category: selectedCategory, salon });
                }}>
                <View style={styles.salonImgPlaceholder}>
                  <Text style={styles.salonImgEmoji}>💇</Text>
                </View>
                <View style={styles.salonRowInfo}>
                  <View style={styles.salonNameRow}>
                    <Text style={styles.salonName}>{salon.name}</Text>
                    <Text style={styles.salonDist}>{selectedServices.length} items</Text>
                  </View>
                  <Text style={styles.salonAddr} numberOfLines={1}>📍 {salon.address}</Text>
                  <Text style={styles.servicePreview} numberOfLines={2}>
                    {selectedServices.map((service) => service.name).join(' • ')}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <Text style={styles.emptySheetText}>No services found in this category.</Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
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
  card: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  grid: { alignItems: 'flex-start' },
  catItem: { alignItems: 'center', width: '25%', marginBottom: 20 },
  catCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catEmoji: { fontSize: 28 },
  catName: { fontSize: 11, color: Colors.text, textAlign: 'center' },
  emptyText: { width: '100%', textAlign: 'center', color: Colors.textSecondary, paddingVertical: 20 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    minHeight: 220,
  },
  bsHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.greyBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  bsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bsTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  bsSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  closeX: { fontSize: 18, color: Colors.textSecondary, padding: 4 },
  salonRow: {
    flexDirection: 'row',
    backgroundColor: Colors.greyLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  salonImgPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salonImgEmoji: { fontSize: 32 },
  salonRowInfo: { flex: 1, padding: 10 },
  salonNameRow: { flexDirection: 'row', justifyContent: 'space-between' },
  salonName: { fontSize: 14, fontWeight: '700', color: Colors.text, flex: 1 },
  salonDist: { fontSize: 11, color: Colors.textSecondary },
  salonAddr: { fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  servicePreview: { fontSize: 12, color: Colors.text },
  emptySheetText: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 20 },
});
