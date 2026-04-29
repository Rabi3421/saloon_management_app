import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getPublicAppContent } from '../../api/appContent';

interface Props { navigation: any }

export default function AboutUsScreen({ navigation }: Props) {
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

  const handleLinkPress = async (url: string) => {
    if (url === 'app://location') {
      navigation.navigate('Location');
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 36 }} />
      </View>
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo / Brand */}
        <View style={styles.brandBox}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>{content?.salon.name?.slice(0, 1).toUpperCase() || 'S'}</Text>
          </View>
          <Text style={styles.appName}>{content?.appName}</Text>
          <Text style={styles.version}>{content?.brandTagline}</Text>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{content?.aboutUs.title}</Text>
          <Text style={styles.cardBody}>
            {content?.aboutUs.headline}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Who We Are</Text>
          <Text style={styles.cardBody}>
            {content?.aboutUs.summary}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardBody}>{content?.aboutUs.mission}</Text>
        </View>

        {(content?.aboutUs.values || []).map((value, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{value.title}</Text>
            <Text style={styles.cardBody}>{value.description}</Text>
          </View>
        ))}

        {/* Stats */}
        <View style={styles.statsRow}>
          {(content?.aboutUs.quickFacts || []).map(({ value, label }) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statVal}>{value}</Text>
              <Text style={styles.statLbl}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Social Links */}
        <Text style={styles.sectionLabel}>Useful Links</Text>
        <View style={styles.socialCard}>
          {(content?.aboutUs.links || []).map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.socialRow, i > 0 && styles.socialSep]}
              onPress={() => handleLinkPress(s.url)}>
              <Text style={styles.socialIcon}>{s.url === 'app://location' ? '📍' : s.url.startsWith('mailto:') ? '📧' : '🌐'}</Text>
              <Text style={styles.socialLabel}>{s.label}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.copyright}>{content?.aboutUs.footer}</Text>
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
