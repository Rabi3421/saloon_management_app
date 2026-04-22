import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

export default function LocationScreen() {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Location</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.comingSoon}>Map view coming soon</Text>
        <Text style={styles.sub}>Nearby salons will appear here</Text>
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
});
