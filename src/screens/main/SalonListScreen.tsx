import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { SALONS } from '../../data/mockData';

const { width, height } = Dimensions.get('window');

const SORT_OPTIONS = [
  'Most Popular',
  'Nearby Salons',
  'Rating: 4-5 Star',
  'Rating: 1-3 Star',
  'Rating',
];

interface Props {
  navigation: any;
  route: any;
}

export default function SalonListScreen({ navigation, route }: Props) {
  const title = route?.params?.title || route?.params?.category || 'Nearby Salons';
  const [isGrid, setIsGrid] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Most Popular');
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFav = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id],
    );
  };

  const renderGridItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => navigation.navigate('SalonDetail', { salon: item })}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <TouchableOpacity style={styles.heartGrid} onPress={() => toggleFav(item.id)}>
        <Text style={styles.heartIcon}>{favorites.includes(item.id) ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
      <View style={styles.gridInfo}>
        <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.gridAddr} numberOfLines={1}>📍 {item.address}</Text>
        <View style={styles.gridBottomRow}>
          <Text style={styles.gridRating}>⭐ {item.rating}</Text>
          <TouchableOpacity
            style={styles.bookBtnSmall}
            onPress={() => navigation.navigate('SalonDetail', { salon: item })}>
            <Text style={styles.bookBtnSmallText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => navigation.navigate('SalonDetail', { salon: item })}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: item.image }} style={styles.listImage} />
        <TouchableOpacity style={styles.heartList} onPress={() => toggleFav(item.id)}>
          <Text style={styles.heartIcon}>{favorites.includes(item.id) ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listInfo}>
        <View style={styles.listNameRow}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.listDist}>↔ {item.distance}</Text>
        </View>
        <Text style={styles.listAddr} numberOfLines={1}>📍 {item.address}</Text>
        <View style={styles.listBottomRow}>
          <Text style={styles.listRating}>⭐ {item.rating} ({item.reviews})</Text>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => navigation.navigate('SalonDetail', { salon: item })}>
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Sort & Toggle bar */}
      <View style={styles.sortBar}>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
          <Text style={styles.sortIcon}>⚙️</Text>
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
        <View style={styles.toggleBtns}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isGrid && styles.toggleBtnActive]}
            onPress={() => setIsGrid(false)}>
            <Text style={styles.toggleIcon}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isGrid && styles.toggleBtnActive]}
            onPress={() => setIsGrid(true)}>
            <Text style={styles.toggleIcon}>⊞</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        {isGrid ? (
          <FlatList
            data={SALONS}
            keyExtractor={item => item.id}
            numColumns={2}
            renderItem={renderGridItem}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={SALONS}
            keyExtractor={item => item.id}
            renderItem={renderListItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSort}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSort(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowSort(false)}>
          <View style={styles.sortSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sortHeader}>
              <Text style={styles.sortSheetTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSort(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.sortOption}
                  onPress={() => setSelectedSort(opt)}>
                  <Text style={styles.sortOptionText}>{opt}</Text>
                  <View
                    style={[
                      styles.radio,
                      selectedSort === opt && styles.radioSelected,
                    ]}>
                    {selectedSort === opt && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setShowSort(false)}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  sortBar: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortIcon: { fontSize: 16 },
  sortText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  toggleBtns: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  toggleIcon: { fontSize: 18, color: Colors.white },
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  gridContent: { paddingHorizontal: 12, paddingBottom: 16 },
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  listImage: { width: 90, height: 90 },
  heartList: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: { fontSize: 14 },
  listInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  listNameRow: { flexDirection: 'row', justifyContent: 'space-between' },
  listName: { fontSize: 14, fontWeight: '700', color: Colors.text, flex: 1 },
  listDist: { fontSize: 11, color: Colors.textSecondary },
  listAddr: { fontSize: 11, color: Colors.textSecondary, marginVertical: 3 },
  listBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  listRating: { fontSize: 12, color: Colors.text },
  bookBtn: {
    backgroundColor: Colors.greyLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bookBtnText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  gridCard: {
    width: (width - 36) / 2,
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginHorizontal: 4,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  gridImage: { width: '100%', height: 110 },
  heartGrid: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: { padding: 8 },
  gridName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  gridAddr: { fontSize: 10, color: Colors.textSecondary, marginVertical: 2 },
  gridBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridRating: { fontSize: 11, color: Colors.text },
  bookBtnSmall: {
    backgroundColor: Colors.greyLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bookBtnSmallText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortSheetTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  closeX: { fontSize: 18, color: Colors.textSecondary },
  sortOptions: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 8,
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyLight,
  },
  sortOptionText: { fontSize: 15, color: Colors.text },
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
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
