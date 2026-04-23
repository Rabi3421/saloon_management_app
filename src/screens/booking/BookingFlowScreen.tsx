import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getPublicStaff, StaffMember } from '../../api/staff';
import { createBooking } from '../../api/bookings';

const { width } = Dimensions.get('window');

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
  const { salon, serviceId } = route.params || {};
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublicStaff();
        setStaffList(data);
        if (data.length > 0) setSelectedStaff(data[0]._id);
      } catch {
        // fall back to empty list silently
      } finally {
        setLoadingStaff(false);
      }
    })();
  }, []);

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
    const bookingDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    setBookingLoading(true);
    try {
      const booking = await createBooking({
        serviceId: serviceId || '',
        staffId: selectedStaff || undefined,
        bookingDate,
        timeSlot: selectedTime,
      });
      navigation.navigate('OrderSummary', {
        salon,
        date: `${MONTHS[month]} ${selectedDay}, ${year}`,
        time: selectedTime,
        staffId: selectedStaff,
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
