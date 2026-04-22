import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

interface Props { navigation: any }

export default function AboutUsScreen({ navigation }: Props) {
  const socials = [
    { icon: '🌐', label: 'Website', url: 'https://saloonapp.com' },
    { icon: '📘', label: 'Facebook', url: 'https://facebook.com' },
    { icon: '📸', label: 'Instagram', url: 'https://instagram.com' },
    { icon: '🐦', label: 'Twitter', url: 'https://twitter.com' },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo / Brand */}
        <View style={styles.brandBox}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>✂️</Text>
          </View>
          <Text style={styles.appName}>Saloon App</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Who We Are</Text>
          <Text style={styles.cardBody}>
            Saloon App is your go-to platform for discovering and booking premium hair and beauty services near you. We connect clients with the best salons, barbershops, and beauty professionals in your city.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardBody}>
            Our mission is to simplify the salon booking experience — saving you time and helping local beauty businesses grow through seamless technology.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[['500+', 'Salons'], ['50K+', 'Clients'], ['4.9★', 'Rating']].map(([val, lbl]) => (
            <View key={lbl} style={styles.statItem}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Social Links */}
        <Text style={styles.sectionLabel}>Follow Us</Text>
        <View style={styles.socialCard}>
          {socials.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.socialRow, i > 0 && styles.socialSep]}
              onPress={() => Linking.openURL(s.url)}>
              <Text style={styles.socialIcon}>{s.icon}</Text>
              <Text style={styles.socialLabel}>{s.label}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.copyright}>© 2025 Saloon App. All rights reserved.</Text>
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
  brandBox: { alignItems: 'center', paddingVertical: 24 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: { fontSize: 36 },
  appName: { fontSize: 22, fontWeight: '800', color: Colors.black },
  version: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.black, marginBottom: 8 },
  cardBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 21 },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.primary, borderRadius: 14,
    padding: 16, justifyContent: 'space-around', marginBottom: 20, marginTop: 8,
  },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: Colors.white },
  statLbl: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  socialCard: {
    backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', marginBottom: 20,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  socialRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  socialSep: { borderTopWidth: 1, borderTopColor: Colors.greyBorder },
  socialIcon: { fontSize: 20, marginRight: 14 },
  socialLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.black },
  arrow: { fontSize: 18, color: Colors.grey },
  copyright: { textAlign: 'center', fontSize: 12, color: Colors.grey },
});
