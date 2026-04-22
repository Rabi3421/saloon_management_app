import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { CATEGORIES, SALONS } from '../../data/mockData';

const { height } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: any;
}

export default function CategoriesScreen({ navigation, route }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const handleCategoryPress = (catName: string) => {
    setSelectedCategory(catName);
    setShowBottomSheet(true);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.card}>
        <FlatList
          data={CATEGORIES}
          numColumns={4}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.catItem}
              onPress={() => handleCategoryPress(item.name)}>
              <View style={[styles.catCircle, { backgroundColor: item.bgColor }]}>
                <Text style={styles.catEmoji}>{item.icon}</Text>
              </View>
              <Text style={styles.catName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bottom Sheet */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowBottomSheet(false)}>
          <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.bsHandle} />
            <View style={styles.bsHeader}>
              <View>
                <Text style={styles.bsTitle}>{selectedCategory}</Text>
                <Text style={styles.bsSubtitle}>Over 10 Salons</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBottomSheet(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={SALONS}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.salonRow}
                  onPress={() => {
                    setShowBottomSheet(false);
                    navigation.navigate('SalonDetail', { salon: item });
                  }}>
                  <View style={styles.salonImgPlaceholder}>
                    <Text style={styles.salonImgEmoji}>💇</Text>
                  </View>
                  <View style={styles.salonRowInfo}>
                    <View style={styles.salonNameRow}>
                      <Text style={styles.salonName}>{item.name}</Text>
                      <Text style={styles.salonDist}>↔ {item.distance}</Text>
                    </View>
                    <Text style={styles.salonAddr} numberOfLines={1}>
                      📍 {item.address}
                    </Text>
                    <View style={styles.salonBottomRow}>
                      <Text style={styles.salonRating}>
                        ⭐ {item.rating} ({item.reviews})
                      </Text>
                      <TouchableOpacity
                        style={styles.bookBtn}
                        onPress={() => {
                          setShowBottomSheet(false);
                          navigation.navigate('SalonDetail', { salon: item });
                        }}>
                        <Text style={styles.bookBtnText}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
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
    maxHeight: height * 0.75,
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
    marginBottom: 10,
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
  salonAddr: { fontSize: 11, color: Colors.textSecondary, marginVertical: 2 },
  salonBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  salonRating: { fontSize: 12, color: Colors.text },
  bookBtn: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bookBtnText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
});
