import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageBackground,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { SALONS, CATEGORIES, PROMO_BANNERS } from '../../data/mockData';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFav = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id],
    );
  };

  const nearbySalons = SALONS.slice(0, 4);
  const popularSalons = SALONS.slice(2, 6);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>IR</Text>
          </View>
          <View>
            <Text style={styles.userName}>Ibne Riead</Text>
            <Text style={styles.userLocation}>📍 2715 Ash Dr. San Jose, So...</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar (purple bg) */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={Colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Promo banners */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bannerScroll}
          contentContainerStyle={styles.bannerContent}>
          {PROMO_BANNERS.map(banner => (
            <View key={banner.id} style={[styles.promoBanner, { backgroundColor: banner.color }]}>
              <View style={styles.promoText}>
                <Text style={styles.promoDiscount}>{banner.discount}</Text>
                <Text style={styles.promoTitle}>{banner.title}</Text>
                <Text style={styles.promoSubtitle}>{banner.subtitle}</Text>
                <TouchableOpacity style={styles.exploreBtn}>
                  <Text style={styles.exploreBtnText}>Explore</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.promoEmoji}>💆‍♀️</Text>
            </View>
          ))}
        </ScrollView>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.catItem}
              onPress={() => navigation.navigate('SalonList', { category: cat.name })}>
              <View style={[styles.catCircle, { backgroundColor: cat.bgColor }]}>
                <Text style={styles.catEmoji}>{cat.icon}</Text>
              </View>
              <Text style={styles.catName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Nearby Salons */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Salons</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SalonList', { title: 'Nearby Salons' })}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbySalonsScroll}>
          {nearbySalons.map(salon => (
            <TouchableOpacity
              key={salon.id}
              style={styles.nearbyCard}
              onPress={() => navigation.navigate('SalonDetail', { salon })}>
              <Image source={{ uri: salon.image }} style={styles.nearbyImage} />
              <TouchableOpacity
                style={styles.heartNearby}
                onPress={() => toggleFav(salon.id)}>
                <Text>{favorites.includes(salon.id) ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <View style={styles.nearbyInfo}>
                <View style={styles.nearbyNameRow}>
                  <Text style={styles.nearbyName}>{salon.name}</Text>
                  <Text style={styles.nearbyDistance}>↔ {salon.distance}</Text>
                </View>
                <Text style={styles.nearbyAddress} numberOfLines={1}>
                  📍 {salon.address}
                </Text>
                <View style={styles.nearbyBottomRow}>
                  <Text style={styles.rating}>⭐ {salon.rating} ({salon.reviews})</Text>
                  <TouchableOpacity
                    style={styles.bookNowBtn}
                    onPress={() => navigation.navigate('SalonDetail', { salon })}>
                    <Text style={styles.bookNowText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Salons */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Salons</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SalonList', { title: 'Popular Salons' })}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {popularSalons.map(salon => (
          <TouchableOpacity
            key={salon.id}
            style={styles.popularCard}
            onPress={() => navigation.navigate('SalonDetail', { salon })}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: salon.image }} style={styles.popularImage} />
              <TouchableOpacity
                style={styles.heartPopular}
                onPress={() => toggleFav(salon.id)}>
                <Text>{favorites.includes(salon.id) ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.popularInfo}>
              <View style={styles.popularNameRow}>
                <Text style={styles.popularName}>{salon.name}</Text>
                <Text style={styles.popularDistance}>↔ {salon.distance}</Text>
              </View>
              <Text style={styles.popularAddress} numberOfLines={1}>
                📍 {salon.address}
              </Text>
              <View style={styles.popularBottomRow}>
                <Text style={styles.rating}>⭐ {salon.rating} ({salon.reviews})</Text>
                <TouchableOpacity
                  style={styles.bookNowBtn}
                  onPress={() => navigation.navigate('SalonDetail', { salon })}>
                  <Text style={styles.bookNowText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  userName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  userLocation: { fontSize: 12, color: Colors.textSecondary },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  bellIcon: { fontSize: 18 },
  searchContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: { fontSize: 18 },
  scroll: { flex: 1, backgroundColor: Colors.background },
  bannerScroll: { marginTop: 16 },
  bannerContent: { paddingHorizontal: 16, gap: 12 },
  promoBanner: {
    width: width * 0.75,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  promoText: { flex: 1 },
  promoDiscount: { fontSize: 22, fontWeight: '800', color: Colors.white },
  promoTitle: { fontSize: 14, fontWeight: '700', color: Colors.white, marginTop: 2 },
  promoSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2, marginBottom: 10 },
  exploreBtn: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  exploreBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  promoEmoji: { fontSize: 48 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  viewAll: { fontSize: 13, color: Colors.textSecondary },
  catScroll: { paddingHorizontal: 16, gap: 16 },
  catItem: { alignItems: 'center', width: 64 },
  catCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  catEmoji: { fontSize: 24 },
  catName: { fontSize: 11, color: Colors.text, textAlign: 'center' },
  nearbySalonsScroll: { paddingHorizontal: 16, gap: 14 },
  nearbyCard: {
    width: width * 0.6,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  nearbyImage: { width: '100%', height: 130 },
  heartNearby: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyInfo: { padding: 10 },
  nearbyNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nearbyName: { fontSize: 14, fontWeight: '700', color: Colors.text, flex: 1 },
  nearbyDistance: { fontSize: 11, color: Colors.textSecondary },
  nearbyAddress: { fontSize: 11, color: Colors.textSecondary, marginVertical: 4 },
  nearbyBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  rating: { fontSize: 12, color: Colors.text },
  bookNowBtn: {
    backgroundColor: Colors.greyLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  bookNowText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  popularCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  popularImage: { width: 90, height: 90 },
  heartPopular: {
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
  popularInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  popularNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  popularName: { fontSize: 14, fontWeight: '700', color: Colors.text, flex: 1 },
  popularDistance: { fontSize: 11, color: Colors.textSecondary },
  popularAddress: { fontSize: 11, color: Colors.textSecondary, marginVertical: 3 },
  popularBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
});
