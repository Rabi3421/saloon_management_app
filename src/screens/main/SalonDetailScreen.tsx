import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { addFavourite, getFavourites, removeFavourite } from '../../api/favourites';
import { getPublicSalonInfo, getPublicServices, PublicService, SalonInfo } from '../../api/public';
import { getPublicReviews } from '../../api/reviews';
import { getPublicStaff, StaffMember } from '../../api/staff';

const { width } = Dimensions.get('window');
const TABS = ['About', 'Services', 'Gallery', 'Reviews'] as const;
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
];

type TabKey = (typeof TABS)[number];

interface ReviewItem {
  _id: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  customerId?: { name?: string } | string;
}

interface Props {
  navigation: any;
  route: any;
}

function formatReviewDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatHours(hours?: SalonInfo['openingHours']) {
  if (!hours?.length) return [];
  return hours.map((item) => ({
    day: item.day,
    text: item.closed ? 'Closed' : `${item.start} - ${item.end}`,
    closed: !!item.closed,
  }));
}

export default function SalonDetailScreen({ navigation, route }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>((route?.params?.initialTab as TabKey) || 'About');
  const [salon, setSalon] = useState<SalonInfo | null>(route?.params?.salon ?? null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(route?.params?.service?._id ?? route?.params?.serviceId ?? '');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [salonData, servicesData, staffData, reviewData, favourites] = await Promise.all([
          getPublicSalonInfo(),
          getPublicServices(),
          getPublicStaff(),
          getPublicReviews(20, 1),
          getFavourites().catch(() => []),
        ]);
        setSalon(salonData);
        setServices(servicesData);
        setStaff(staffData);
        setReviews(reviewData as ReviewItem[]);
        setIsFavorite(!!salonData._id && favourites.some((item) => item.salonId === salonData._id));
        if (!selectedServiceId && servicesData.length > 0) {
          setSelectedServiceId(servicesData[0]._id);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedServiceId]);

  const groupedServices = useMemo(() => {
    return services.reduce<Record<string, PublicService[]>>((acc, service) => {
      const key = service.category || 'General';
      acc[key] = acc[key] ? [...acc[key], service] : [service];
      return acc;
    }, {});
  }, [services]);

  const selectedService = services.find((item) => item._id === selectedServiceId) ?? services[0];
  const galleryImages = salon?.images?.length ? salon.images : PLACEHOLDER_IMAGES;
  const openingHours = formatHours(salon?.openingHours);
  const heroImage = galleryImages[0] ?? PLACEHOLDER_IMAGES[0];

  const toggleFavourite = async () => {
    if (!salon?._id) return;
    setIsFavorite((prev) => !prev);
    try {
      if (isFavorite) await removeFavourite(salon._id);
      else await addFavourite(salon._id);
    } catch {
      setIsFavorite((prev) => !prev);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!salon) {
    return (
      <View style={styles.loaderWrap}>
        <Text style={styles.emptyText}>Salon details are unavailable right now.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.heroContainer}>
        <Image source={{ uri: heroImage }} style={styles.heroImage} resizeMode="cover" />
        <SafeAreaView edges={['top']} style={styles.heroOverlay}>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.heroBtnText}>←</Text>
            </TouchableOpacity>
            <View style={styles.heroRightBtns}>
              <TouchableOpacity style={styles.heroBtn} onPress={toggleFavourite}>
                <Text style={styles.heroBtnText}>{isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentCard}>
        <View style={styles.salonInfo}>
          <View style={styles.salonInfoTop}>
            <Text style={styles.salonName}>{salon.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: salon.isActive ? '#E8F5E9' : '#FFEBEE' }]}>
              <Text style={[styles.statusText, { color: salon.isActive ? Colors.green : Colors.red }]}>
                {salon.isActive ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
          <Text style={styles.salonAddress}>📍 {salon.address}</Text>
          <View style={styles.salonMeta}>
            <Text style={styles.salonRating}>
              ⭐ {salon.rating?.toFixed?.(1) ?? salon.rating ?? '0'} ({salon.reviewCount ?? reviews.length} Reviews)
            </Text>
            {selectedService ? <Text style={styles.directionLink}>From ₹{selectedService.price}</Text> : null}
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'About' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Us</Text>
                <Text style={styles.aboutText}>
                  {salon.about || 'Welcome to our salon. Book services, explore the team, and enjoy a seamless appointment experience.'}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Our Staff</Text>
                {staff.length === 0 ? (
                  <Text style={styles.aboutText}>No staff members are listed yet.</Text>
                ) : (
                  staff.map((member) => (
                    <View key={member._id} style={styles.staffRow}>
                      <View style={styles.staffAvatar}>
                        <Text style={styles.staffAvatarText}>{member.name.slice(0, 2).toUpperCase()}</Text>
                      </View>
                      <View style={styles.staffInfo}>
                        <Text style={styles.staffName}>{member.name}</Text>
                        <Text style={styles.staffRole}>{member.specialization}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Working Hours</Text>
                {openingHours.length === 0 ? (
                  <Text style={styles.aboutText}>Working hours will appear once updated by the salon.</Text>
                ) : (
                  openingHours.map((item) => (
                    <View key={item.day} style={styles.hoursRow}>
                      <Text style={[styles.hoursDay, item.closed && styles.closedText]}>{item.day}</Text>
                      <Text style={[styles.hoursTime, item.closed && styles.closedText]}>{item.text}</Text>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Us</Text>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{salon.email || 'Not available'}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Phone Number</Text>
                  <Text style={styles.contactValue}>{salon.phone || 'Not available'}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Website</Text>
                  <Text style={styles.contactValue}>{salon.website || 'Not available'}</Text>
                </View>
              </View>
              <View style={{ height: 100 }} />
            </ScrollView>
          )}

          {activeTab === 'Services' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {Object.entries(groupedServices).map(([category, categoryServices]) => (
                <View key={category} style={styles.serviceSection}>
                  <Text style={styles.serviceSectionTitle}>{category}</Text>
                  {categoryServices.map((service) => {
                    const selected = selectedServiceId === service._id;
                    return (
                      <TouchableOpacity key={service._id} style={styles.serviceItem} onPress={() => setSelectedServiceId(service._id)}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.serviceItemName}>{service.name}</Text>
                          {service.description ? <Text style={styles.serviceDescription}>{service.description}</Text> : null}
                        </View>
                        <View style={styles.serviceItemRight}>
                          <Text style={styles.serviceItemDuration}>{service.duration} min</Text>
                          <Text style={styles.serviceItemPrice}>₹{service.price}</Text>
                          <View style={[styles.serviceRadio, selected && styles.serviceRadioSelected]}>
                            {selected && <View style={styles.serviceRadioDot} />}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}

          {activeTab === 'Gallery' && (
            <FlatList
              data={galleryImages}
              numColumns={2}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="cover" />}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          {activeTab === 'Reviews' && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {reviews.length === 0 ? (
                <Text style={styles.aboutText}>No reviews yet.</Text>
              ) : (
                reviews.map((review) => {
                  const reviewerName = typeof review.customerId === 'object' ? review.customerId?.name || 'Customer' : 'Customer';
                  return (
                    <View key={review._id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewAvatar}>
                          <Text style={styles.reviewAvatarText}>{reviewerName[0]}</Text>
                        </View>
                        <View style={styles.reviewUserInfo}>
                          <Text style={styles.reviewUser}>{reviewerName}</Text>
                          <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
                        </View>
                        <View style={styles.reviewRatingBadge}>
                          <Text style={styles.reviewRatingText}>⭐ {review.rating}</Text>
                        </View>
                      </View>
                      <Text style={styles.reviewComment}>{review.comment || 'No written review provided.'}</Text>
                    </View>
                  );
                })
              )}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}
        </View>
      </View>

      <View style={styles.bookNowContainer}>
        <TouchableOpacity
          style={styles.bookNowBtn}
          onPress={() => navigation.navigate('BookingFlow', { salon, serviceId: selectedService?._id, service: selectedService })}>
          <Text style={styles.bookNowText}>{selectedService ? `Book ${selectedService.name}` : 'Book Now'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  heroContainer: { height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  heroActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  heroRightBtns: { flexDirection: 'row', gap: 8 },
  heroBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  heroBtnText: { fontSize: 16 },
  contentCard: { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, paddingTop: 16 },
  salonInfo: { paddingHorizontal: 16, marginBottom: 12 },
  salonInfoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 12 },
  salonName: { fontSize: 20, fontWeight: '800', color: Colors.text, flex: 1 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  salonAddress: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  salonMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  salonRating: { fontSize: 13, color: Colors.text },
  directionLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  tabText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  tabTextActive: { color: Colors.white, fontWeight: '800' },
  tabContent: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  section: { borderBottomWidth: 1, borderBottomColor: Colors.greyBorder, marginBottom: 8, paddingBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  aboutText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  staffRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.greyLight },
  staffAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  staffAvatarText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  staffRole: { fontSize: 12, color: Colors.textSecondary },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.greyLight },
  hoursDay: { fontSize: 13, color: Colors.text },
  hoursTime: { fontSize: 13, color: Colors.textSecondary },
  closedText: { color: Colors.red },
  contactRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.greyLight },
  contactLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  contactValue: { fontSize: 13, color: Colors.text },
  serviceSection: { borderBottomWidth: 1, borderBottomColor: Colors.greyBorder, marginBottom: 6, paddingBottom: 6 },
  serviceSectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.greyLight, gap: 12 },
  serviceItemName: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  serviceDescription: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  serviceItemRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceItemDuration: { fontSize: 12, color: Colors.textSecondary },
  serviceItemPrice: { fontSize: 14, fontWeight: '700', color: Colors.text },
  serviceRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.greyBorder, alignItems: 'center', justifyContent: 'center' },
  serviceRadioSelected: { borderColor: Colors.primary },
  serviceRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  galleryImage: { width: (width - 48) / 2, height: 110, borderRadius: 10, margin: 3 },
  reviewCard: { backgroundColor: Colors.greyLight, borderRadius: 14, padding: 12, marginBottom: 10 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  reviewAvatarText: { color: Colors.white, fontWeight: '700' },
  reviewUserInfo: { flex: 1 },
  reviewUser: { fontSize: 14, fontWeight: '700', color: Colors.text },
  reviewDate: { fontSize: 11, color: Colors.textSecondary },
  reviewRatingBadge: { backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  reviewRatingText: { fontSize: 12, color: Colors.text },
  reviewComment: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  bookNowContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, borderTopWidth: 1, borderTopColor: Colors.greyBorder },
  bookNowBtn: { backgroundColor: Colors.primary, borderRadius: 30, paddingVertical: 15, alignItems: 'center' },
  bookNowText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
