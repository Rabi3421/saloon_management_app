import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getPublicServices, PublicService } from '../../api/public';
import { getPublicStaff, StaffMember } from '../../api/staff';
import { createBooking } from '../../api/bookings';
import { getPublicPromotions, Promotion } from '../../api/promotions';
import apiClient from '../../api/client';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM',
];

// Steps: 1=service, 2=datetime, 3=staff, 4=offer
type Step = 1 | 2 | 3 | 4;

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
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [services, setServices] = useState<PublicService[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(service?._id || serviceId || '');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>(promotionId || '');
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<Step>(1);
  const scrollRef = useRef<ScrollView>(null);

  const animate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const goToStep = (step: Step) => {
    animate();
    setActiveStep(step);
    // slight delay so layout settles before scrolling
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 120);
  };

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

  // ─── Derived ────────────────────────────────────────────────
  const selectedService = services.find(i => i._id === selectedServiceId) || service;
  const selectedStaffItem = staffList.find(i => i._id === selectedStaff);
  const selectedPromotion = promotions.find(i => i._id === selectedPromotionId);

  const formatPromotionValue = (p: Promotion) => {
    if (p.type === 'percentage') return `${p.value}% OFF`;
    if (p.type === 'free_service') return 'FREE';
    if (p.type === 'gift_voucher') return `₹${p.value} VOUCHER`;
    return `₹${p.value} OFF`;
  };

  const getPromotionPreview = (p: Promotion) => {
    if (!selectedService) return 'Select a service to validate this offer';
    const eligibleIds = (p.appliesToServiceIds || []).map((x: any) => x._id);
    const applies = eligibleIds.length === 0 || eligibleIds.includes(selectedService._id);
    if (!applies) return 'Not valid for the selected service';
    if ((p.minBookingAmount || 0) > Number(selectedService.price || 0))
      return `Requires minimum booking of ₹${p.minBookingAmount}`;
    return p.description || 'Tap to apply this offer';
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const today = now.getDate();
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };

  const handleContinue = async () => {
    if (!selectedServiceId) { Alert.alert('Select Service', 'Please choose a service first.'); return; }
    if (!selectedTime) { Alert.alert('Select Time', 'Please pick a time slot first.'); return; }
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
        booking, salon,
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

  useEffect(() => {
    if (!selectedStaff) return;
    const bookingDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      try {
        const res = await apiClient.get('/api/bookings/availability', { params: { staffId: selectedStaff, date: bookingDate } });
        if (!cancelled) setDisabledSlots(res.data.data || []);
      } catch { setDisabledSlots([]); }
      finally { if (!cancelled) setLoadingSlots(false); }
    })();
    return () => { cancelled = true; };
  }, [selectedStaff, year, month, selectedDay]);



  // ─── Summary values ──────────────────────────────────────
  const totalPrice = selectedService ? Number(selectedService.price) : 0;
  const discount = selectedPromotion?.type === 'percentage'
    ? Math.round(totalPrice * (selectedPromotion.value as number) / 100)
    : selectedPromotion?.type === 'flat' ? (selectedPromotion.value as number) : 0;
  const finalPrice = Math.max(0, totalPrice - discount);

  const service1Summary = selectedService
    ? `${selectedService.name}  ·  ${selectedService.duration} min  ·  ₹${selectedService.price}`
    : undefined;
  const dt1Summary = selectedTime
    ? `${DAYS_SHORT[new Date(year, month, selectedDay).getDay()]}, ${selectedDay} ${MONTHS_SHORT[month]}  ·  ${selectedTime}`
    : undefined;
  const staff1Summary = selectedStaffItem
    ? `${selectedStaffItem.name}${selectedStaffItem.specialization ? `  ·  ${selectedStaffItem.specialization}` : ''}`
    : undefined;
  const offer1Summary = selectedPromotion
    ? `${selectedPromotion.code}  —  ${formatPromotionValue(selectedPromotion)}`
    : undefined;

  // ─── Step header ─────────────────────────────────────────
  const StepHeader = ({
    step, icon, title, summary, onEdit,
  }: { step: Step; icon: string; title: string; summary?: string; onEdit?: () => void }) => {
    const isDone = step < activeStep;
    const isActive = step === activeStep;
    return (
      <TouchableOpacity
        activeOpacity={isDone ? 0.7 : 1}
        onPress={isDone ? onEdit : undefined}
        style={[styles.stepHeader, isActive && styles.stepHeaderActive, isDone && styles.stepHeaderDone]}>
        <View style={[styles.stepBadge, isActive && styles.stepBadgeActive, isDone && styles.stepBadgeDone]}>
          {isDone
            ? <Text style={styles.stepBadgeCheck}>✓</Text>
            : <Text style={[styles.stepBadgeText, isActive && styles.stepBadgeTextActive]}>{step}</Text>}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.stepTitle, isActive && styles.stepTitleActive, isDone && styles.stepTitleDone]}>{title}</Text>
          {isDone && summary ? <Text style={styles.stepSummary} numberOfLines={1}>{summary}</Text> : null}
          {isActive && !isDone ? <Text style={styles.stepHint}>Select an option below ↓</Text> : null}
        </View>
        <Text style={styles.stepIcon}>{icon}</Text>
        {isDone && <Text style={styles.editLabel}>Edit</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        {([1, 2, 3, 4] as Step[]).map(s => (
          <View key={s} style={[styles.progressSegment, s <= activeStep && styles.progressSegmentActive]} />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">

        {/* ── STEP 1: Service ── */}
        <View style={styles.stepCard}>
          <StepHeader step={1} icon="✂️" title="Choose a Service" summary={service1Summary} onEdit={() => goToStep(1)} />
          {activeStep === 1 && (
            <View style={styles.stepBody}>
              {loadingServices
                ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
                : (
                  <>
                    {services.map(item => {
                      const sel = item._id === selectedServiceId;
                      return (
                        <TouchableOpacity
                          key={item._id}
                          style={[styles.serviceCard, sel && styles.serviceCardSelected]}
                          onPress={() => setSelectedServiceId(item._id)}
                          activeOpacity={0.8}>
                          <View style={[styles.serviceIconBox, sel && styles.serviceIconBoxSel]}>
                            <Text style={styles.serviceIconText}>💇</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.serviceName, sel && styles.serviceNameSel]}>{item.name}</Text>
                            <Text style={styles.serviceMeta}>⏱ {item.duration} min  ·  {item.category}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end', gap: 4 }}>
                            <Text style={styles.servicePrice}>₹{item.price}</Text>
                            {sel && <View style={styles.selDot}><Text style={styles.selDotText}>✓</Text></View>}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    <TouchableOpacity
                      style={[styles.stepNextBtn, !selectedServiceId && styles.stepNextBtnDisabled]}
                      onPress={() => selectedServiceId && goToStep(2)}
                      disabled={!selectedServiceId}
                      activeOpacity={0.85}>
                      <Text style={styles.stepNextBtnText}>Next: Pick Date & Time  →</Text>
                    </TouchableOpacity>
                  </>
                )}
            </View>
          )}
        </View>

        {/* ── STEP 2: Date & Time ── */}
        <View style={[styles.stepCard, activeStep < 2 && styles.stepCardLocked]}>
          <StepHeader step={2} icon="📅" title="Date & Time" summary={dt1Summary} onEdit={() => goToStep(2)} />
          {activeStep === 2 && (
            <View style={styles.stepBody}>
              <View style={styles.calCard}>
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
                  {DAYS_SHORT.map(d => <Text key={d} style={styles.calDayLabel}>{d}</Text>)}
                </View>
                <View style={styles.calGrid}>
                  {calendarCells.map((cell, idx) => {
                    const isSel = cell === selectedDay;
                    const isToday2 = cell === today && month === now.getMonth() && year === now.getFullYear();
                    const isPast = cell !== null && new Date(year, month, cell) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.calCell, isSel && styles.calCellSelected, isToday2 && !isSel && styles.calCellToday]}
                        onPress={() => cell && !isPast && setSelectedDay(cell)}
                        disabled={!cell || isPast}>
                        <Text style={[styles.calCellText, isSel && styles.calCellTextSelected, isPast && styles.calCellTextPast, isToday2 && !isSel && styles.calCellTextToday]}>
                          {cell || ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <Text style={styles.subLabel}>Available Times</Text>
              {loadingSlots
                ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} />
                : (
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map(slot => {
                      const disabled = disabledSlots.includes(slot);
                      const sel = selectedTime === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[styles.timeSlot, sel && styles.timeSlotSelected, disabled && styles.timeSlotDisabled]}
                          onPress={() => !disabled && setSelectedTime(slot)}
                          disabled={disabled}
                          activeOpacity={0.8}>
                          <Text style={[styles.timeSlotText, sel && styles.timeSlotTextSelected, disabled && styles.timeSlotTextDisabled]}>{slot}</Text>
                          {disabled && <Text style={styles.bookedTag}>Booked</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              <TouchableOpacity
                style={[styles.stepNextBtn, !selectedTime && styles.stepNextBtnDisabled]}
                onPress={() => selectedTime && goToStep(3)}
                disabled={!selectedTime}
                activeOpacity={0.85}>
                <Text style={styles.stepNextBtnText}>Next: Choose Staff  →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── STEP 3: Staff ── */}
        <View style={[styles.stepCard, activeStep < 3 && styles.stepCardLocked]}>
          <StepHeader step={3} icon="👤" title="Select Staff" summary={staff1Summary} onEdit={() => goToStep(3)} />
          {activeStep === 3 && (
            <View style={styles.stepBody}>
              {loadingStaff
                ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
                : (
                  <>
                    {staffList.map((staff: StaffMember) => {
                      const sel = selectedStaff === staff._id;
                      return (
                        <TouchableOpacity
                          key={staff._id}
                          style={[styles.staffCard, sel && styles.staffCardSelected]}
                          onPress={() => setSelectedStaff(staff._id)}
                          activeOpacity={0.8}>
                          <View style={[styles.staffAvatar, sel && styles.staffAvatarSel]}>
                            <Text style={styles.staffAvatarText}>{staff.name.substring(0, 2).toUpperCase()}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.staffName, sel && styles.staffNameSel]}>{staff.name}</Text>
                            <Text style={styles.staffRole}>{staff.specialization}</Text>
                          </View>
                          {sel && <View style={styles.selDot}><Text style={styles.selDotText}>✓</Text></View>}
                        </TouchableOpacity>
                      );
                    })}
                    {staffList.length === 0 && <Text style={styles.emptyNote}>No staff available.</Text>}
                    <TouchableOpacity style={styles.stepNextBtn} onPress={() => goToStep(4)} activeOpacity={0.85}>
                      <Text style={styles.stepNextBtnText}>Next: Apply Offer  →</Text>
                    </TouchableOpacity>
                  </>
                )}
            </View>
          )}
        </View>

        {/* ── STEP 4: Offer ── */}
        <View style={[styles.stepCard, activeStep < 4 && styles.stepCardLocked]}>
          <StepHeader step={4} icon="🎟️" title="Apply Offer (Optional)" summary={offer1Summary} onEdit={() => goToStep(4)} />
          {activeStep === 4 && (
            <View style={styles.stepBody}>
              {loadingPromotions
                ? <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
                : promotions.length === 0
                  ? <Text style={styles.emptyNote}>No active offers right now.</Text>
                  : promotions.map(item => {
                      const sel = item._id === selectedPromotionId;
                      return (
                        <TouchableOpacity
                          key={item._id}
                          style={[styles.promoCard, sel && styles.promoCardSelected]}
                          onPress={() => setSelectedPromotionId(sel ? '' : item._id)}
                          activeOpacity={0.8}>
                          <View style={styles.promoTopRow}>
                            <View style={[styles.promoBadge, sel && styles.promoBadgeSel]}>
                              <Text style={[styles.promoBadgeText, sel && styles.promoBadgeTextSel]}>{formatPromotionValue(item)}</Text>
                            </View>
                            <View style={[styles.promoCodePill, sel && styles.promoCodePillSel]}>
                              <Text style={[styles.promoCodeText, sel && styles.promoCodeTextSel]}>{item.code}</Text>
                            </View>
                          </View>
                          <Text style={[styles.promoTitle, sel && styles.promoTitleSel]}>{item.title}</Text>
                          <Text style={styles.promoDescription}>{getPromotionPreview(item)}</Text>
                          {sel && <Text style={styles.promoApplied}>✓ Offer Applied</Text>}
                        </TouchableOpacity>
                      );
                    })}
            </View>
          )}
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {selectedService && (
          <View style={styles.priceSummary}>
            <View>
              <Text style={styles.priceLabel}>Total{discount > 0 ? ' (after offer)' : ''}</Text>
              {discount > 0 && <Text style={styles.priceOriginal}>₹{totalPrice}</Text>}
            </View>
            <Text style={styles.priceFinal}>₹{finalPrice}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.continueBtn, (bookingLoading || activeStep < 4) && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={bookingLoading || activeStep < 4}
          activeOpacity={0.9}>
          {bookingLoading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.continueBtnText}>
                {activeStep < 4 ? `Complete Step ${activeStep} to Continue` : 'Confirm Booking'}
              </Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0ECFB' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F0ECFB',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  backArrow: { fontSize: 18, color: Colors.black },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.black },

  progressBar: { flexDirection: 'row', gap: 5, paddingHorizontal: 16, marginBottom: 14 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#DDD5F7' },
  progressSegmentActive: { backgroundColor: Colors.primary },

  scroll: { paddingHorizontal: 14, paddingTop: 2 },

  stepCard: {
    backgroundColor: Colors.white, borderRadius: 20, marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#6C3FC5', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  stepCardLocked: { opacity: 0.55 },

  stepHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
  },
  stepHeaderActive: { backgroundColor: '#FBF8FF' },
  stepHeaderDone: { backgroundColor: '#F2FBF7' },

  stepBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center',
  },
  stepBadgeActive: { backgroundColor: Colors.primary },
  stepBadgeDone: { backgroundColor: Colors.green },
  stepBadgeText: { fontSize: 13, fontWeight: '700', color: '#999' },
  stepBadgeTextActive: { color: Colors.white },
  stepBadgeCheck: { fontSize: 14, fontWeight: '800', color: Colors.white },

  stepTitle: { fontSize: 14, fontWeight: '600', color: '#999' },
  stepTitleActive: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  stepTitleDone: { color: Colors.text, fontWeight: '600' },
  stepSummary: { fontSize: 12, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  stepHint: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  stepIcon: { fontSize: 20 },
  editLabel: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  stepBody: { paddingHorizontal: 14, paddingBottom: 16, paddingTop: 2 },

  stepNextBtn: {
    marginTop: 14, backgroundColor: Colors.primary, borderRadius: 30,
    paddingVertical: 13, alignItems: 'center',
  },
  stepNextBtnDisabled: { backgroundColor: '#C4BAE8' },
  stepNextBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },

  subLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginTop: 10, marginBottom: 8 },

  serviceCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12,
    borderWidth: 1.5, borderColor: Colors.greyBorder, marginBottom: 8, gap: 10,
    backgroundColor: Colors.white,
  },
  serviceCardSelected: { borderColor: Colors.primary, backgroundColor: '#FAF7FF' },
  serviceIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.greyLight, alignItems: 'center', justifyContent: 'center',
  },
  serviceIconBoxSel: { backgroundColor: '#EDE5FF' },
  serviceIconText: { fontSize: 22 },
  serviceName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  serviceNameSel: { color: Colors.primary },
  serviceMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  servicePrice: { fontSize: 15, fontWeight: '800', color: Colors.primary },

  calCard: { backgroundColor: '#FAF7FF', borderRadius: 16, padding: 12, marginBottom: 6 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  calNavBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  calNavArrow: { fontSize: 20, color: Colors.text, lineHeight: 24 },
  calMonthYear: { fontSize: 15, fontWeight: '700', color: Colors.text },
  calDaysRow: { flexDirection: 'row', marginBottom: 4 },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  calCellSelected: { backgroundColor: Colors.primary },
  calCellToday: { borderWidth: 1.5, borderColor: Colors.primary },
  calCellText: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  calCellTextSelected: { color: Colors.white, fontWeight: '700' },
  calCellTextPast: { color: '#D1D5DB' },
  calCellTextToday: { color: Colors.primary, fontWeight: '700' },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  timeSlot: {
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 22,
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.greyBorder,
    alignItems: 'center',
  },
  timeSlotSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeSlotDisabled: { backgroundColor: '#F3F4F6', borderColor: '#E9EAEC' },
  timeSlotText: { fontSize: 12, color: Colors.text, fontWeight: '600' },
  timeSlotTextSelected: { color: Colors.white },
  timeSlotTextDisabled: { color: '#C4C8CE' },
  bookedTag: { fontSize: 9, color: '#C4C8CE', marginTop: 1 },

  staffCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12,
    borderWidth: 1.5, borderColor: Colors.greyBorder, marginBottom: 8, gap: 10,
    backgroundColor: Colors.white,
  },
  staffCardSelected: { borderColor: Colors.primary, backgroundColor: '#FAF7FF' },
  staffAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#DDD5F7', alignItems: 'center', justifyContent: 'center',
  },
  staffAvatarSel: { backgroundColor: Colors.primary },
  staffAvatarText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  staffName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  staffNameSel: { color: Colors.primary },
  staffRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },

  promoCard: {
    borderRadius: 16, padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: Colors.greyBorder, backgroundColor: Colors.white,
  },
  promoCardSelected: { borderColor: Colors.primary, backgroundColor: '#FAF7FF' },
  promoTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  promoBadge: {
    backgroundColor: Colors.greyLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  promoBadgeSel: { backgroundColor: '#EDE5FF' },
  promoBadgeText: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary },
  promoBadgeTextSel: { color: Colors.primary },
  promoCodePill: {
    borderRadius: 8, backgroundColor: Colors.greyLight, paddingHorizontal: 10, paddingVertical: 5,
  },
  promoCodePillSel: { backgroundColor: '#EDE5FF' },
  promoCodeText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1 },
  promoCodeTextSel: { color: Colors.primary },
  promoTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  promoTitleSel: { color: Colors.primary },
  promoDescription: { fontSize: 12, color: Colors.textSecondary },
  promoApplied: { fontSize: 12, color: Colors.green, fontWeight: '700', marginTop: 8 },

  selDot: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  selDotText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  emptyNote: { color: Colors.textSecondary, fontSize: 13, marginBottom: 8, textAlign: 'center', paddingVertical: 8 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: '#EEE8FF',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 }, elevation: 8,
  },
  priceSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priceLabel: { fontSize: 12, color: Colors.textSecondary },
  priceOriginal: { fontSize: 12, color: '#C4C8CE', textDecorationLine: 'line-through' },
  priceFinal: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  continueBtn: {
    backgroundColor: Colors.primary, borderRadius: 30, paddingVertical: 14, alignItems: 'center',
  },
  continueBtnDisabled: { backgroundColor: '#B8ACDF' },
  continueBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});

