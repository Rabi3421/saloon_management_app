import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getPublicAppContent } from '../../api/appContent';

interface Props { navigation: any; route: any }

export default function RateReviewScreen({ navigation, route }: Props) {
  const [content, setContent] = useState<Awaited<ReturnType<typeof getPublicAppContent>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setContent(await getPublicAppContent());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openRateUrl = async () => {
    const primaryUrl = Platform.OS === 'ios'
      ? content?.rateApp.iosUrl || content?.rateApp.webFallbackUrl
      : content?.rateApp.androidUrl;
    const fallbackUrl = Platform.OS === 'android'
      ? content?.rateApp.androidWebUrl || content?.rateApp.webFallbackUrl
      : content?.rateApp.webFallbackUrl;

    if (!primaryUrl && !fallbackUrl) {
      Alert.alert('Unavailable', 'No rating link is configured yet.');
      return;
    }

    try {
      await Linking.openURL(primaryUrl || fallbackUrl || '');
    } catch {
      if (fallbackUrl) {
        await Linking.openURL(fallbackUrl);
      } else {
        Alert.alert('Unavailable', 'We could not open the rating page right now.');
      }
    }
  };

  const openFeedbackEmail = async () => {
    if (!content?.rateApp.feedbackEmail) return;
    await Linking.openURL(`mailto:${content.rateApp.feedbackEmail}`);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate the App</Text>
        <View style={{ width: 36 }} />
      </View>
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.salonCard}>
            <Text style={styles.salonIcon}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.salonName}>{content?.rateApp.subtitle}</Text>
              <Text style={styles.salonAddress}>{content?.rateApp.description}</Text>
            </View>
          </View>

          <Text style={styles.rateLabel}>{content?.rateApp.title}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Text key={s} style={[styles.star, styles.starActive]}>★</Text>
            ))}
          </View>

          {(content?.rateApp.highlights || []).map((item, index) => (
            <View key={index} style={styles.highlightRow}>
              <Text style={styles.highlightBullet}>•</Text>
              <Text style={styles.highlightText}>{item}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.submitBtn} onPress={openRateUrl}>
            <Text style={styles.submitBtnText}>{content?.rateApp.primaryLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={openFeedbackEmail}>
            <Text style={styles.secondaryBtnText}>{content?.rateApp.secondaryLabel}</Text>
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
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
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  highlightBullet: { fontSize: 16, color: Colors.primary, marginRight: 8, lineHeight: 20 },
  highlightText: { flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 30, paddingVertical: 14,
    alignItems: 'center', marginTop: 24,
  },
  submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
});
