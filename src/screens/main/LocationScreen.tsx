import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getPublicSalonInfo, SalonInfo } from '../../api/public';

export default function LocationScreen() {
  const [salon, setSalon] = useState<SalonInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublicSalonInfo();
        setSalon(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Location</Text>
      </View>
      <View style={styles.center}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" />
        ) : (
          <>
            <Text style={styles.mapEmoji}>📍</Text>
            <Text style={styles.comingSoon}>{salon?.name || 'Salon Location'}</Text>
            <Text style={styles.sub}>{salon?.address || 'Address not available'}</Text>
            {salon?.phone ? <Text style={styles.meta}>📞 {salon.phone}</Text> : null}
            {salon?.website ? <Text style={styles.meta}>🌐 {salon.website}</Text> : null}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapEmoji: { fontSize: 64, marginBottom: 16 },
  comingSoon: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  sub: { fontSize: 13, color: Colors.textSecondary },
  meta: { fontSize: 13, color: Colors.text, marginTop: 8 },
});
