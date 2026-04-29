import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getPublicServices, PublicService } from '../../api/public';
import { getPublicStaff, StaffMember } from '../../api/staff';
import { createBooking } from '../../api/bookings';
import { getPublicPromotions, Promotion } from '../../api/promotions';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface Props {
  navigation: any;
  route: any;
}

export default function BookingFlowScreen({ navigation, route }: Props) {
  const { salon, serviceId, service, promotionId } = route.params || {};
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [services, setServices] = useState<PublicService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(service?._id || serviceId || '');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>(promotionId || '');
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [staffData, servicesData, promotionsData] = await Promise.all([
          getPublicStaff(),
          getPublicServices(),
          getPublicPromotions(),
        ]);
        setStaffList(staffData);
        setServices(servicesData);
        setPromotions(promotionsData);
        if (staffData.length > 0) setSelectedStaff(staffData[0]._id);
        if (!selectedServiceId && servicesData.length > 0) setSelectedServiceId(servicesData[0]._id);
      } catch {
        // fall back to empty list silently
      } finally {
        setLoadingStaff(false);
        setLoadingServices(false);
        setLoadingPromotions(false);
      }
    })();
  }, []);

  const selectedService = services.find(item => item._id === selectedServiceId) || service;
  const selectedStaffItem = staffList.find(item => item._id === selectedStaff);
  const selectedPromotion = promotions.find(item => item._id === selectedPromotionId);

  const formatPromotionValue = (promotion: Promotion) => {
    if (promotion.type === 'percentage') return `${promotion.value}% OFF`;
    if (promotion.type === 'free_service') return 'FREE SERVICE';
    if (promotion.type === 'gift_voucher') return `₹${promotion.value} VOUCHER`;
    return `₹${promotion.value} OFF`;
  };

  const getPromotionPreview = (promotion: Promotion) => {
    if (!selectedService) return 'Select a service to validate this offer';

    const eligibleIds = (promotion.appliesToServiceIds || []).map(item => item._id);
    const applies = eligibleIds.length === 0 || eligibleIds.includes(selectedService._id);
    if (!applies) return 'Not valid for the currently selected service';
    if ((promotion.minBookingAmount || 0) > Number(selectedService.price || 0)) {
      return `Requires minimum booking of ₹${promotion.minBookingAmount}`;
    }
    return promotion.description || 'Tap continue to apply this offer to your booking';
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const today = now.getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleContinue = async () => {
    if (!selectedServiceId) {
      Alert.alert('Select Service', 'Please choose a service to continue.');
      return;
    }
    const bookingDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    setBookingLoading(true);
    try {
      const booking = await createBooking({
        serviceId: selectedServiceId,
        staffId: selectedStaff || undefined,
        promotionId: selectedPromotionId || undefined,
        bookingDate,
        timeSlot: selectedTime,
      });
      navigation.navigate('OrderSummary', {
        booking,
        salon,
        date: `${MONTHS[month]} ${selectedDay}, ${year}`,
        time: selectedTime,
        staff: selectedStaffItem,
        service: selectedService,
        promotion: typeof booking.promotionId === 'object' ? booking.promotionId : selectedPromotion,
        bookingId: booking._id,
      });
    } catch (err: any) {
      Alert.alert('Booking Failed', err.message || 'Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Select Service</Text>
        {loadingServices ? (
          <ActivityIndicator color={Colors.primary} style={{ marginBottom: 16 }} />
        ) : (
          <View style={styles.servicesList}>
            {services.map(item => {
              const selected = item._id === selectedServiceId;
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.serviceCard, selected && styles.serviceCardSelected]}
                  onPress={() => setSelectedServiceId(item._id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    <Text style={styles.serviceMeta}>{item.category} · {item.duration} min</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.servicePrice}>₹{item.price}</Text>
                    {selected && <Text style={styles.serviceSelected}>Selected</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>Apply Offer</Text>
        {loadingPromotions ? (
          <ActivityIndicator color={Colors.primary} style={{ marginBottom: 16 }} />
        ) : promotions.length === 0 ? (
          <Text style={styles.promoEmpty}>No active offers available.</Text>
        ) : (
          <View style={styles.promoList}>
            {promotions.map(item => {
              const selected = item._id === selectedPromotionId;
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.promoCard, selected && styles.promoCardSelected]}
                  onPress={() => setSelectedPromotionId(selected ? '' : item._id)}>
                  <View style={styles.promoTopRow}>
                    <Text style={styles.promoCode}>{item.code}</Text>
                    <Text style={styles.promoValue}>{formatPromotionValue(item)}</Text>
                  </View>
                  <Text style={styles.promoTitle}>{item.title}</Text>
                  <Text style={styles.promoDescription}>{getPromotionPreview(item)}</Text>
                  {selected && <Text style={styles.promoApplied}>Offer selected</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Calendar */}
        <View style={styles.card}>
          <View style={styles.calHeader}>
            <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
              <Text style={styles.calNavArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calMonthYear}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
              <Text style={styles.calNavArrow}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.calDaysRow}>
            {DAYS_SHORT.map(d => (
              <Text key={d} style={styles.calDayLabel}>{d}</Text>
            ))}
          </View>
          <View style={styles.calGrid}>
            {calendarCells.map((cell, idx) => {
              const isSelected = cell === selectedDay;
              const isToday = cell === today && month === now.getMonth() && year === now.getFullYear();
              const isPast = cell !== null &&
                new Date(year, month, cell) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.calCell,
                    isSelected && styles.calCellSelected,
                    isToday && !isSelected && styles.calCellToday,
                  ]}
                  onPress={() => cell && !isPast && setSelectedDay(cell)}
                  disabled={!cell || isPast}>
                  <Text
                    style={[
                      styles.calCellText,
                      isSelected && styles.calCellTextSelected,
                      isPast && styles.calCellTextPast,
                      isToday && !isSelected && styles.calCellTextToday,
                    ]}>
                    {cell || ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time slots */}
        <Text style={styles.sectionTitle}>Select Time</Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map(slot => (
            <TouchableOpacity
              key={slot}
              style={[styles.timeSlot, selectedTime === slot && styles.timeSlotSelected]}
              onPress={() => setSelectedTime(slot)}>
              <Text style={[styles.timeSlotText, selectedTime === slot && styles.timeSlotTextSelected]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Staff selection */}
        <Text style={styles.sectionTitle}>Select Staff</Text>
        {loadingStaff ? (
          <ActivityIndicator color={Colors.primary} style={{ marginBottom: 16 }} />
        ) : (
          <View style={styles.staffList}>
            {staffList.map((staff: StaffMember) => (
              <TouchableOpacity
                key={staff._id}
                style={[styles.staffCard, selectedStaff === staff._id && styles.staffCardSelected]}
                onPress={() => setSelectedStaff(staff._id)}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.staffAvatarText}>
                    {staff.name.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.staffInfo}>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  <Text style={styles.staffRole}>{staff.specialization}</Text>
                </View>
                {selectedStaff === staff._id && (
                  <View style={styles.staffCheck}>
                    <Text style={styles.staffCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {staffList.length === 0 && (
              <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>No staff available.</Text>
            )}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.continueBtn, bookingLoading && { opacity: 0.7 }]} onPress={handleContinue} disabled={bookingLoading}>
          {bookingLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.continueBtnText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
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
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.greyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNavArrow: { fontSize: 20, color: Colors.text, lineHeight: 24 },
  calMonthYear: { fontSize: 16, fontWeight: '700', color: Colors.text },
  calDaysRow: { flexDirection: 'row', marginBottom: 8 },
  calDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  calCellSelected: { backgroundColor: Colors.primary },
  calCellToday: { borderWidth: 1.5, borderColor: Colors.primary },
  calCellText: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  calCellTextSelected: { color: Colors.white, fontWeight: '700' },
  calCellTextPast: { color: Colors.greyBorder },
  calCellTextToday: { color: Colors.primary, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  timeSlot: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.greyBorder,
  },
  timeSlotSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeSlotText: { fontSize: 13, color: Colors.text },
  timeSlotTextSelected: { color: Colors.white, fontWeight: '700' },
  servicesList: { gap: 10, marginBottom: 18 },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.greyBorder,
  },
  serviceCardSelected: { borderColor: Colors.primary, backgroundColor: '#F5F0FF' },
  serviceName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  serviceMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  servicePrice: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  serviceSelected: { fontSize: 11, color: Colors.primary, marginTop: 2 },
  promoEmpty: { color: Colors.textSecondary, fontSize: 13, marginBottom: 18 },
  promoList: { gap: 10, marginBottom: 20 },
  promoCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.greyBorder,
  },
  promoCardSelected: { borderColor: Colors.primary, backgroundColor: '#F5F0FF' },
  promoTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  promoCode: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  promoValue: { fontSize: 12, fontWeight: '800', color: Colors.text },
  promoTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginTop: 6 },
  promoDescription: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  promoApplied: { fontSize: 12, color: Colors.green, marginTop: 8, fontWeight: '700' },
  staffList: { gap: 10, marginBottom: 16 },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.greyBorder,
    gap: 10,
  },
  staffCardSelected: { borderColor: Colors.primary, backgroundColor: '#F5F0FF' },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffAvatarText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  staffRole: { fontSize: 12, color: Colors.textSecondary },
  staffRating: { fontSize: 13, color: Colors.text },
  staffCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffCheckText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  footer: {
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
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
