import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

const FAQS = [
  { q: 'How do I book an appointment?', a: 'Go to any salon page and tap "Book Now". Choose your service, date, time, and staff member, then confirm your booking.' },
  { q: 'Can I cancel my booking?', a: 'Yes, you can cancel up to 2 hours before your appointment from the Bookings tab without any cancellation fee.' },
  { q: 'How do I change my password?', a: 'Go to Profile → Settings and tap "Change Password". You will need to verify your current password first.' },
  { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards (Visa, Mastercard), and cash on arrival. You can manage your cards in Profile → Payment Methods.' },
  { q: 'How do I leave a review?', a: 'After your appointment is completed, you can leave a review from the Bookings tab or from My Reviews in your profile.' },
  { q: 'I did not receive a confirmation email', a: 'Please check your spam folder. If still missing, contact us via the email below or use the in-app chat.' },
];

interface Props { navigation: any }

export default function HelpSupportScreen({ navigation }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        {FAQS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={styles.faqCard}
            onPress={() => setOpenIndex(openIndex === i ? null : i)}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ} numberOfLines={openIndex === i ? undefined : 1}>{faq.q}</Text>
              <Text style={styles.chevron}>{openIndex === i ? '▲' : '▼'}</Text>
            </View>
            {openIndex === i && <Text style={styles.faqA}>{faq.a}</Text>}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionLabel}>Contact Us</Text>
        <View style={styles.contactCard}>
          {[
            { icon: '📧', label: 'Email', value: 'support@saloonapp.com', action: () => Linking.openURL('mailto:support@saloonapp.com') },
            { icon: '📞', label: 'Phone', value: '+1 (800) 123-4567', action: () => Linking.openURL('tel:+18001234567') },
            { icon: '💬', label: 'Live Chat', value: 'Available 9am – 6pm', action: () => {} },
          ].map((c, i) => (
            <TouchableOpacity key={i} style={[styles.contactRow, i > 0 && styles.contactSep]} onPress={c.action}>
              <Text style={styles.contactIcon}>{c.icon}</Text>
              <View style={styles.contactLabels}>
                <Text style={styles.contactLabel}>{c.label}</Text>
                <Text style={styles.contactValue}>{c.value}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  faqCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.black, marginRight: 8 },
  chevron: { fontSize: 11, color: Colors.grey },
  faqA: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginTop: 10 },
  contactCard: {
    backgroundColor: Colors.white, borderRadius: 12, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
    marginBottom: 16,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  contactSep: { borderTopWidth: 1, borderTopColor: Colors.greyBorder },
  contactIcon: { fontSize: 22, marginRight: 12 },
  contactLabels: { flex: 1 },
  contactLabel: { fontSize: 12, color: Colors.textSecondary },
  contactValue: { fontSize: 14, fontWeight: '600', color: Colors.black, marginTop: 1 },
  arrow: { fontSize: 18, color: Colors.grey },
});
