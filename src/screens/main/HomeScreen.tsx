import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import {
  getPublicSalonInfo,
  getPublicServices,
  SalonInfo,
  PublicService,
} from '../../api/public';
import { getPublicPromotions, Promotion } from '../../api/promotions';

const { width } = Dimensions.get('window');

const CATEGORY_META: Record<string, { icon: string; bgColor: string }> = {
  'Hair Cut':   { icon: '✂️', bgColor: '#FEE2E2' },
  Hair:         { icon: '✂️', bgColor: '#FEE2E2' },
  Shaves:       { icon: '🪒', bgColor: '#EDE9FE' },
  Shave:        { icon: '🪒', bgColor: '#EDE9FE' },
  Makeup:       { icon: '💄', bgColor: '#FFEDD5' },
  'Nail Cut':   { icon: '💅', bgColor: '#F3E8FF' },
  Nail:         { icon: '💅', bgColor: '#F3E8FF' },
  'Hair Color': { icon: '🎨', bgColor: '#DBEAFE' },
  Color:        { icon: '🎨', bgColor: '#DBEAFE' },
  Facial:       { icon: '🧖', bgColor: '#DCFCE7' },
  Massage:      { icon: '💆', bgColor: '#FEF9C3' },
  Waxing:       { icon: '��', bgColor: '#ECFDF5' },
  Spa:          { icon: '🛁', bgColor: '#E0F2FE' },
};
const DEFAULT_META = { icon: '💈', bgColor: '#F3F4F6' };

function formatPromotionValue(promotion: Promotion) {
  if (promotion.type === 'percentage') return `${promotion.value}% OFF`;
  if (promotion.type === 'free_service') return 'FREE SERVICE';
  if (promotion.type === 'gift_voucher') return `₹${promotion.value} VOUCHER`;
  return `₹${promotion.value} OFF`;
}

function getPromotionSubtitle(promotion: Promotion) {
  const serviceNames = (promotion.appliesToServiceIds || []).map(service => service.name).filter(Boolean);
  if (serviceNames.length > 0) return serviceNames.join(', ');
  return promotion.description || 'Use this offer on your next booking';
}

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();

  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = React.useMemo(() => {
    const seen = new Set<string>();
    return services
      .map(s => s.category)
      .filter(c => c && !seen.has(c) && seen.add(c))
      .map((name, i) => ({ id: String(i), name }));
  }, [services]);

  const fetchData = useCallback(async () => {
    try {
      const [salonData, servicesData, promotionsData] = await Promise.all([
        getPublicSalonInfo(),
        getPublicServices(),
        getPublicPromotions(),
      ]);
      setSalon(salonData);
      setServices(servicesData);
      setPromotions(promotionsData);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(); }, [fetchData]);

  const filteredServices = searchQuery.length > 1
    ? services.filter(
        s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const showcaseImages = React.useMemo(
    () => Array.from(new Set([
      salon?.coverImage,
      salon?.logo,
      ...(salon?.images ?? []),
    ].filter((item): item is string => Boolean(item)))).slice(0, 6),
    [salon],
  );

  const featureBanners = React.useMemo(
    () => (salon?.featureBanners ?? []).filter(banner => banner.title || banner.image),
    [salon],
  );

  const heroImage = salon?.coverImage || showcaseImages[0] || null;
  const heroDescription = salon?.tagline || salon?.about || 'Discover trusted services, curated visuals, and offers from your salon.';

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.name ?? 'Guest'}</Text>
            <Text style={styles.userLocation} numberOfLines={1}>
              📍 {salon?.address ?? 'Fetching location...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={Colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() =>
              searchQuery.trim() && navigation.navigate('SalonList', { search: searchQuery })
            }
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ fontSize: 16, color: Colors.grey }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => navigation.navigate('SalonList', {})}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }>

        {/* Inline search results */}
        {searchQuery.length > 1 && filteredServices.length > 0 && (
          <View style={styles.searchResults}>
            {filteredServices.slice(0, 5).map(s => (
              <TouchableOpacity
                key={s._id}
                style={styles.searchResultItem}
                onPress={() => navigation.navigate('BookingFlow', { serviceId: s._id, salon })}>
                <Text style={styles.searchResultName}>{s.name}</Text>
                <Text style={styles.searchResultMeta}>
                  {s.category} · ₹{s.price} · {s.duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Salon hero */}
        {salon && (
          <View style={styles.heroCard}>
            {heroImage ? (
              <Image source={{ uri: heroImage }} style={styles.heroImage} resizeMode="cover" />
            ) : (
              <View style={[styles.heroImage, styles.heroFallback]}>
                <Text style={styles.heroFallbackIcon}>💆‍♀️</Text>
              </View>
            )}
            <View style={styles.heroOverlay}>
              <Text style={styles.promoTag}>✨ Welcome to</Text>
              <Text style={styles.promoTitle}>{salon.name}</Text>
              <Text style={styles.heroTagline} numberOfLines={2}>{heroDescription}</Text>
              <View style={styles.heroInfoRow}>
                <View style={styles.heroInfoPill}>
                  <Text style={styles.heroInfoText}>⭐ {salon.rating?.toFixed?.(1) ?? salon.rating ?? '4.8'}</Text>
                </View>
                <View style={styles.heroInfoPill}>
                  <Text style={styles.heroInfoText}>{services.length} services</Text>
                </View>
                <View style={styles.heroInfoPill}>
                  <Text style={styles.heroInfoText}>{promotions.length} offers</Text>
                </View>
              </View>
              <View style={styles.heroActionsRow}>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => navigation.navigate('SalonDetail', { salon })}>
                  <Text style={styles.exploreBtnText}>Explore</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heroSecondaryBtn}
                  onPress={() => navigation.navigate('BookingFlow', { salon, serviceId: services[0]?._id })}>
                  <Text style={styles.heroSecondaryBtnText}>Book now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {featureBanners.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Salon Highlights</Text>
              <Text style={styles.viewAll}>Fresh from the owner</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannerScroll}>
              {featureBanners.map((banner, index) => (
                <TouchableOpacity
                  key={`${banner.title}-${index}`}
                  style={styles.bannerCard}
                  onPress={() => navigation.navigate('SalonDetail', { salon })}>
                  {banner.image ? (
                    <Image source={{ uri: banner.image }} style={styles.bannerImage} resizeMode="cover" />
                  ) : null}
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle} numberOfLines={1}>{banner.title}</Text>
                    {banner.subtitle ? (
                      <Text style={styles.bannerSubtitle} numberOfLines={2}>{banner.subtitle}</Text>
                    ) : null}
                    <Text style={styles.bannerAction}>{banner.ctaLabel || 'See more'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {showcaseImages.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Inside the Salon</Text>
              <Text style={styles.viewAll}>Visual preview</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
              {showcaseImages.map((image, index) => (
                <TouchableOpacity
                  key={`${image}-${index}`}
                  style={styles.galleryCard}
                  onPress={() => navigation.navigate('SalonDetail', { salon, initialTab: 'Gallery' })}>
                  <Image source={{ uri: image }} style={styles.galleryCardImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories available</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat.name] ?? DEFAULT_META;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catItem}
                  onPress={() => navigation.navigate('SalonList', { category: cat.name })}>
                  <View style={[styles.catCircle, { backgroundColor: meta.bgColor }]}>
                    <Text style={styles.catEmoji}>{meta.icon}</Text>
                  </View>
                  <Text style={styles.catName} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Active Offers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Offers</Text>
          <Text style={styles.viewAll}>Managed by {salon?.name || 'your salon'}</Text>
        </View>
        {promotions.length === 0 ? (
          <Text style={styles.emptyText}>No active offers available right now.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offerScroll}>
            {promotions.map(promotion => {
              const preferredServiceId = promotion.appliesToServiceIds?.[0]?._id;
              return (
                <TouchableOpacity
                  key={promotion._id}
                  style={styles.offerCard}
                  onPress={() => navigation.navigate('BookingFlow', {
                    salon,
                    promotionId: promotion._id,
                    serviceId: preferredServiceId,
                  })}>
                  <View style={styles.offerTopRow}>
                    <Text style={styles.offerBadge}>{formatPromotionValue(promotion)}</Text>
                    <Text style={styles.offerCode}>{promotion.code}</Text>
                  </View>
                  <Text style={styles.offerTitle} numberOfLines={1}>{promotion.title}</Text>
                  <Text style={styles.offerSubtitle} numberOfLines={2}>{getPromotionSubtitle(promotion)}</Text>
                  <View style={styles.offerBottomRow}>
                    <Text style={styles.offerMin}>Min. booking ₹{promotion.minBookingAmount || 0}</Text>
                    <Text style={styles.offerAction}>Use Offer</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Popular Services */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SalonList', { title: 'Popular Services' })}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {services.length === 0 ? (
          <Text style={styles.emptyText}>No services available</Text>
        ) : (
          services.slice(0, 6).map(service => {
            const meta = CATEGORY_META[service.category] ?? DEFAULT_META;
            return (
              <TouchableOpacity
                key={service._id}
                style={styles.popularCard}
                onPress={() => navigation.navigate('BookingFlow', { serviceId: service._id, salon })}>
                <View style={[styles.popularImageBox, { backgroundColor: meta.bgColor }]}>
                  <Text style={styles.popularEmoji}>{meta.icon}</Text>
                </View>
                <View style={styles.popularInfo}>
                  <View style={styles.popularNameRow}>
                    <Text style={styles.popularName} numberOfLines={1}>{service.name}</Text>
                    <Text style={styles.popularDistance}>{service.duration} min</Text>
                  </View>
                  <Text style={styles.popularAddress}>{service.category}</Text>
                  <View style={styles.popularBottomRow}>
                    <Text style={styles.rating}>₹{service.price}</Text>
                    <TouchableOpacity
                      style={styles.bookNowBtn}
                      onPress={() => navigation.navigate('BookingFlow', { serviceId: service._id, salon })}>
                      <Text style={styles.bookNowText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.background,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
  userName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  userLocation: { fontSize: 12, color: Colors.textSecondary, maxWidth: width * 0.5 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  bellIcon: { fontSize: 18 },
  searchContainer: {
    backgroundColor: Colors.primary, paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 30, paddingHorizontal: 14, height: 46,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  filterBtn: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.primaryDark,
    alignItems: 'center', justifyContent: 'center',
  },
  filterIcon: { fontSize: 18 },
  scroll: { flex: 1, backgroundColor: Colors.background },
  searchResults: {
    backgroundColor: Colors.white, marginHorizontal: 16, marginTop: 12, borderRadius: 12,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  searchResultItem: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.greyBorder },
  searchResultName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  searchResultMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  promoBanner: {
    marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#7C3AED',
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 250,
    backgroundColor: Colors.primaryDark,
  },
  heroImage: { width: '100%', height: 250 },
  heroFallback: { alignItems: 'center', justifyContent: 'center' },
  heroFallbackIcon: { fontSize: 56 },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: 'rgba(17, 24, 39, 0.38)',
  },
  promoText: { flex: 1 },
  promoTag: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  promoTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 2 },
  promoSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 12 },
  heroTagline: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8, lineHeight: 19 },
  heroInfoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  heroInfoPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroInfoText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  heroActionsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  exploreBtn: {
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7, alignSelf: 'flex-start',
  },
  exploreBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  heroSecondaryBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  heroSecondaryBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  promoEmoji: { fontSize: 52, marginLeft: 8 },
  bannerScroll: { paddingHorizontal: 16, gap: 14 },
  bannerCard: {
    width: width * 0.76,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  bannerImage: { width: '100%', height: 140, backgroundColor: Colors.greyLight },
  bannerContent: { padding: 14 },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  bannerSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 6, lineHeight: 18 },
  bannerAction: { fontSize: 12, color: Colors.primary, fontWeight: '800', marginTop: 12 },
  galleryScroll: { paddingHorizontal: 16, gap: 12 },
  galleryCard: { width: 152, height: 112, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.greyLight },
  galleryCardImage: { width: '100%', height: '100%' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginTop: 22, marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  viewAll: { fontSize: 13, color: Colors.textSecondary },
  emptyText: { fontSize: 13, color: Colors.textSecondary, paddingHorizontal: 16, marginBottom: 8 },
  catScroll: { paddingHorizontal: 16, gap: 16 },
  catItem: { alignItems: 'center', width: 64 },
  catCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catEmoji: { fontSize: 24 },
  catName: { fontSize: 11, color: Colors.text, textAlign: 'center' },
  offerScroll: { paddingHorizontal: 16, gap: 14 },
  offerCard: {
    width: width * 0.72,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  offerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerBadge: {
    backgroundColor: '#F5F0FF',
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    overflow: 'hidden',
  },
  offerCode: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  offerTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginTop: 14 },
  offerSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 6, lineHeight: 18, minHeight: 36 },
  offerBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  offerMin: { fontSize: 12, color: Colors.textSecondary },
  offerAction: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  rating: { fontSize: 12, color: Colors.text },
  bookNowBtn: { backgroundColor: Colors.greyLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  bookNowText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  popularCard: {
    flexDirection: 'row', backgroundColor: Colors.white, marginHorizontal: 16, borderRadius: 16,
    marginBottom: 12, overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  popularImageBox: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  popularEmoji: { fontSize: 36 },
  popularInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  popularNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  popularName: { fontSize: 14, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 4 },
  popularDistance: { fontSize: 11, color: Colors.textSecondary },
  popularAddress: { fontSize: 11, color: Colors.textSecondary, marginVertical: 3 },
  popularBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
});
