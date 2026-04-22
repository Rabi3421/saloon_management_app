import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

interface Props { navigation: any; route: any }

export default function RateReviewScreen({ navigation, route }: Props) {
  const salon = route?.params?.salon || { name: 'Luxury Cuts & Style', address: '123 Style Street' };
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const labels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];

  const submit = () => {
    if (rating === 0) { Alert.alert('Please select a rating'); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate & Review</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Thank You!</Text>
          <Text style={styles.successSub}>Your review has been submitted successfully.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate & Review</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.salonCard}>
          <Text style={styles.salonIcon}>✂️</Text>
          <View>
            <Text style={styles.salonName}>{salon.name}</Text>
            <Text style={styles.salonAddress}>{salon.address}</Text>
          </View>
        </View>

        <Text style={styles.rateLabel}>How was your experience?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(s => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>{labels[rating]}</Text>
        )}

        <Text style={styles.fieldLabel}>Your Review (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share details about your experience..."
          placeholderTextColor={Colors.grey}
          value={review}
          onChangeText={setReview}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={submit}>
          <Text style={styles.submitBtnText}>Submit Review</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
  },
  backArrow: { fontSize: 18, color: Colors.black },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.black },
  scroll: { padding: 16 },
  salonCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12, marginBottom: 24,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  salonIcon: { fontSize: 32 },
  salonName: { fontSize: 15, fontWeight: '700', color: Colors.black },
  salonAddress: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  rateLabel: { fontSize: 16, fontWeight: '700', color: Colors.black, textAlign: 'center', marginBottom: 16 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  star: { fontSize: 42, color: Colors.greyBorder },
  starActive: { color: Colors.star },
  ratingLabel: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: Colors.primary, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 8 },
  textArea: {
    backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.greyBorder,
    padding: 12, fontSize: 14, color: Colors.text, minHeight: 120,
  },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 30, paddingVertical: 14,
    alignItems: 'center', marginTop: 24,
  },
  submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successIcon: { fontSize: 70, marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.black, marginBottom: 10 },
  successSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 30 },
  doneBtn: {
    backgroundColor: Colors.primary, borderRadius: 30, paddingVertical: 12, paddingHorizontal: 40,
  },
  doneBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
