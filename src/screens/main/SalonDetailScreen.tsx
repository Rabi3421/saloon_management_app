import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import {
  SALON_STAFF,
  SALON_SERVICES,
  WORKING_HOURS,
  GALLERY_IMAGES,
  ServiceCategory,
} from '../../data/mockData';

const { width } = Dimensions.get('window');

const TABS = ['About', 'Services', 'Gallery', 'Reviews'];

interface Props {
  navigation: any;
  route: any;
}

function AboutTab({ salon }: { salon: any }) {
  const [aboutOpen, setAboutOpen] = useState(true);
  const [staffOpen, setStaffOpen] = useState(true);
  const [hoursOpen, setHoursOpen] = useState(true);
  const [contactOpen, setContactOpen] = useState(true);

  const Section = ({
    title,
    open,
    toggle,
    children,
  }: {
    title: string;
    open: boolean;
    toggle: () => void;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.chevron}>{open ? '∧' : '∨'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Section title="About Us" open={aboutOpen} toggle={() => setAboutOpen(!aboutOpen)}>
        <Text style={styles.aboutText}>{salon.about}</Text>
      </Section>

      <Section title="Our Staffs" open={staffOpen} toggle={() => setStaffOpen(!staffOpen)}>
        {SALON_STAFF.map(staff => (
          <View key={staff.id} style={styles.staffRow}>
            <View style={styles.staffAvatar}>
              <Text style={styles.staffAvatarText}>{staff.avatar}</Text>
            </View>
            <View style={styles.staffInfo}>
              <Text style={styles.staffName}>{staff.name}</Text>
              <Text style={styles.staffRole}>{staff.role}</Text>
            </View>
            <Text style={styles.staffRating}>⭐ {staff.rating}</Text>
          </View>
        ))}
      </Section>

      <Section
        title="Open - Closed"
        open={hoursOpen}
        toggle={() => setHoursOpen(!hoursOpen)}>
        {WORKING_HOURS.map(wh => (
          <View key={wh.day} style={styles.hoursRow}>
            <Text
              style={[styles.hoursDay, wh.isClosed && styles.closedText]}>
              {wh.day}
            </Text>
            <Text
              style={[styles.hoursTime, wh.isClosed && styles.closedText]}>
              {wh.isClosed ? 'Closed' : wh.hours}
            </Text>
          </View>
        ))}
      </Section>

      <Section
        title="Contact Us"
        open={contactOpen}
        toggle={() => setContactOpen(!contactOpen)}>
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>{salon.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Phone Number</Text>
          <Text style={styles.contactValue}>{salon.phone}</Text>
        </View>
        <View style={styles.contactRow}>
          <Text style={styles.contactLabel}>Website</Text>
          <Text style={styles.contactValue}>{salon.website}</Text>
        </View>
      </Section>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function ServicesTab() {
  const [expandedService, setExpandedService] = useState<string | null>('1');
  const [selectedItem, setSelectedItem] = useState<string | null>('Short');

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {SALON_SERVICES.map((cat: ServiceCategory) => (
        <View key={cat.id} style={styles.serviceSection}>
          <TouchableOpacity
            style={styles.serviceSectionHeader}
            onPress={() =>
              setExpandedService(expandedService === cat.id ? null : cat.id)
            }>
            <Text style={styles.serviceSectionTitle}>{cat.name}</Text>
            <Text style={styles.chevron}>
              {expandedService === cat.id ? '∧' : '∨'}
            </Text>
          </TouchableOpacity>
          {expandedService === cat.id &&
            cat.items.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.serviceItem}
                onPress={() => setSelectedItem(item.name)}>
                <Text style={styles.serviceItemName}>{item.name}</Text>
                <View style={styles.serviceItemRight}>
                  <Text style={styles.serviceItemDuration}>{item.duration}</Text>
                  <Text style={styles.serviceItemPrice}>${item.price}</Text>
                  <View
                    style={[
                      styles.serviceRadio,
                      selectedItem === item.name && styles.serviceRadioSelected,
                    ]}>
                    {selectedItem === item.name && (
                      <View style={styles.serviceRadioDot} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function GalleryTab() {
  const [tab, setTab] = useState<'Photo' | 'Video'>('Photo');

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.galleryTabs}>
        {(['Photo', 'Video'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.galleryTabBtn, tab === t && styles.galleryTabBtnActive]}
            onPress={() => setTab(t)}>
            <Text
              style={[
                styles.galleryTabText,
                tab === t && styles.galleryTabTextActive,
              ]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === 'Photo' ? (
        <FlatList
          data={GALLERY_IMAGES}
          numColumns={2}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.galleryImage}
              resizeMode="cover"
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.noContent}>
          <Text style={styles.noContentText}>No videos available</Text>
        </View>
      )}
    </View>
  );
}

function ReviewsTab() {
  const reviews = [
    { id: '1', user: 'Alice Johnson', rating: 5, comment: 'Amazing service! My hair looks fantastic.', date: '2 days ago' },
    { id: '2', user: 'Bob Smith', rating: 4, comment: 'Great experience overall. Will definitely come back.', date: '1 week ago' },
    { id: '3', user: 'Carol White', rating: 5, comment: 'Best salon in town. Very professional staff.', date: '2 weeks ago' },
    { id: '4', user: 'David Lee', rating: 4, comment: 'Nice atmosphere and friendly barbers.', date: '3 weeks ago' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {reviews.map(review => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewAvatar}>
              <Text style={styles.reviewAvatarText}>{review.user[0]}</Text>
            </View>
            <View style={styles.reviewUserInfo}>
              <Text style={styles.reviewUser}>{review.user}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
            <View style={styles.reviewRatingBadge}>
              <Text style={styles.reviewRatingText}>⭐ {review.rating}</Text>
            </View>
          </View>
          <Text style={styles.reviewComment}>{review.comment}</Text>
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

export default function SalonDetailScreen({ navigation, route }: Props) {
  const { salon } = route.params;
  const [activeTab, setActiveTab] = useState('About');
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <View style={styles.root}>
      {/* Hero image */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: salon.image }} style={styles.heroImage} resizeMode="cover" />
        <SafeAreaView edges={['top']} style={styles.heroOverlay}>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => navigation.goBack()}>
              <Text style={styles.heroBtnText}>←</Text>
            </TouchableOpacity>
            <View style={styles.heroRightBtns}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => setIsFavorite(!isFavorite)}>
                <Text style={styles.heroBtnText}>{isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>⎋</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Content card */}
      <View style={styles.contentCard}>
        {/* Salon info */}
        <View style={styles.salonInfo}>
          <View style={styles.salonInfoTop}>
            <Text style={styles.salonName}>{salon.name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: salon.isOpen ? '#E8F5E9' : '#FFEBEE' },
              ]}>
              <Text
                style={[
                  styles.statusText,
                  { color: salon.isOpen ? Colors.green : Colors.red },
                ]}>
                {salon.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
          <Text style={styles.salonAddress}>📍 {salon.address}</Text>
          <View style={styles.salonMeta}>
            <Text style={styles.salonRating}>
              ⭐ {salon.rating} ({salon.reviews} Reviews)
            </Text>
            <TouchableOpacity>
              <Text style={styles.directionLink}>🗺️ Direction</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'About' && <AboutTab salon={salon} />}
          {activeTab === 'Services' && <ServicesTab />}
          {activeTab === 'Gallery' && <GalleryTab />}
          {activeTab === 'Reviews' && <ReviewsTab />}
        </View>
      </View>

      {/* Book Now button */}
      <View style={styles.bookNowContainer}>
        <TouchableOpacity style={styles.bookNowBtn} onPress={() => navigation.navigate('BookingFlow', { salon })}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  heroContainer: { height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroRightBtns: { flexDirection: 'row', gap: 8 },
  heroBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  heroBtnText: { fontSize: 16 },
  contentCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 16,
  },
  salonInfo: { paddingHorizontal: 16, marginBottom: 12 },
  salonInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  salonName: { fontSize: 20, fontWeight: '800', color: Colors.text, flex: 1 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  salonAddress: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  salonMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  salonRating: { fontSize: 13, color: Colors.text },
  directionLink: { fontSize: 13, color: Colors.primary },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    marginHorizontal: 0,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  tabText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  tabTextActive: { color: Colors.white, fontWeight: '800' },
  tabContent: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyBorder,
    marginBottom: 4,
    paddingBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  chevron: { fontSize: 14, color: Colors.textSecondary },
  sectionBody: { paddingBottom: 8 },
  aboutText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyLight,
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  staffAvatarText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  staffRole: { fontSize: 12, color: Colors.textSecondary },
  staffRating: { fontSize: 13, color: Colors.text },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyLight,
  },
  hoursDay: { fontSize: 13, color: Colors.text },
  hoursTime: { fontSize: 13, color: Colors.textSecondary },
  closedText: { color: Colors.red },
  contactRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.greyLight },
  contactLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 2 },
  contactValue: { fontSize: 13, color: Colors.text },
  serviceSection: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyBorder,
    marginBottom: 2,
  },
  serviceSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    alignItems: 'center',
  },
  serviceSectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.greyLight,
  },
  serviceItemName: { fontSize: 14, color: Colors.text, flex: 1 },
  serviceItemRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceItemDuration: { fontSize: 12, color: Colors.textSecondary },
  serviceItemPrice: { fontSize: 14, fontWeight: '700', color: Colors.text },
  serviceRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.greyBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceRadioSelected: { borderColor: Colors.primary },
  serviceRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  galleryTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.greyLight,
    borderRadius: 25,
    padding: 3,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  galleryTabBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 22,
  },
  galleryTabBtnActive: { backgroundColor: Colors.primary },
  galleryTabText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  galleryTabTextActive: { color: Colors.white },
  galleryImage: {
    width: (width - 48) / 2,
    height: 110,
    borderRadius: 10,
    margin: 3,
  },
  noContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  noContentText: { color: Colors.textSecondary, fontSize: 14 },
  reviewCard: {
    backgroundColor: Colors.greyLight,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reviewAvatarText: { color: Colors.white, fontWeight: '700' },
  reviewUserInfo: { flex: 1 },
  reviewUser: { fontSize: 14, fontWeight: '700', color: Colors.text },
  reviewDate: { fontSize: 11, color: Colors.textSecondary },
  reviewRatingBadge: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reviewRatingText: { fontSize: 12, color: Colors.text },
  reviewComment: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  bookNowContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.greyBorder,
  },
  bookNowBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  bookNowText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
