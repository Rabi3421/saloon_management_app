import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getPublicAppContent } from '../../api/appContent';

interface Props { navigation: any }

export default function HelpSupportScreen({ navigation }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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

  const handleContactPress = async (kind: string, target?: string) => {
    if (kind === 'chat') {
      if (!content?.salon?._id) return;
      navigation.navigate('Chat', {
        conversationId: '',
        name: content.salon.name,
        salonId: content.salon._id,
        phone: content.salon.phone,
        isNew: true,
      });
      return;
    }

    if (!target) return;

    const url =
      kind === 'email' ? `mailto:${target}` :
      kind === 'phone' ? `tel:${target.replace(/[^+\d]/g, '')}` :
      target;

    await Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{content?.helpSupport.intro}</Text>
        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        {(content?.helpSupport.faqs || []).map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={styles.faqCard}
            onPress={() => setOpenIndex(openIndex === i ? null : i)}>
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ} numberOfLines={openIndex === i ? undefined : 1}>{faq.question}</Text>
              <Text style={styles.chevron}>{openIndex === i ? '▲' : '▼'}</Text>
            </View>
            {openIndex === i && <Text style={styles.faqA}>{faq.answer}</Text>}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionLabel}>Contact Us</Text>
        <View style={styles.contactCard}>
          {(content?.helpSupport.contacts || []).map((c, i) => (
            <TouchableOpacity key={i} style={[styles.contactRow, i > 0 && styles.contactSep]} onPress={() => handleContactPress(c.kind, c.target)}>
              <Text style={styles.contactIcon}>{c.kind === 'email' ? '📧' : c.kind === 'phone' ? '📞' : c.kind === 'website' ? '🌐' : '💬'}</Text>
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
  intro: { fontSize: 14, color: Colors.text, lineHeight: 22, marginBottom: 18 },
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
