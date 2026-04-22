import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This includes name, email address, phone number, and payment information.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.',
  },
  {
    title: '3. Information Sharing',
    body: 'We do not share your personal information with third parties except as described in this policy. We may share your information with service providers who assist us in providing the app.',
  },
  {
    title: '4. Data Security',
    body: 'We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no security system is impenetrable and we cannot guarantee the security of your data.',
  },
  {
    title: '5. Cookies and Tracking',
    body: 'We may use cookies and similar tracking technologies to track activity within our app and hold certain information to improve your experience.',
  },
  {
    title: '6. Your Rights',
    body: 'You have the right to access, update, or delete your personal information at any time. You may also opt out of receiving promotional communications from us.',
  },
  {
    title: '7. Contact Us',
    body: 'If you have any questions about this Privacy Policy, please contact us at privacy@saloonapp.com.',
  },
];

interface Props { navigation: any }

export default function PrivacyPolicyScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
        <Text style={styles.intro}>
          Your privacy is important to us. This Privacy Policy explains how Saloon App collects, uses, and protects your personal information when you use our application.
        </Text>
        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}
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
  lastUpdated: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },
  intro: { fontSize: 14, color: Colors.text, lineHeight: 22, marginBottom: 20 },
  section: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.black, marginBottom: 8 },
  sectionBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
