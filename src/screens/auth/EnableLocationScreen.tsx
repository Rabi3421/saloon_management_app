import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export default function EnableLocationScreen({ navigation }: Props) {
  const [enabled, setEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Location</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Map illustration */}
        <View style={styles.mapIllustration}>
          <View style={styles.mapBg}>
            <Text style={styles.mapGridH1} />
            <Text style={styles.mapGridH2} />
          </View>
          {/* Map pin */}
          <View style={styles.pinContainer}>
            <View style={styles.pin}>
              <Text style={styles.pinEmoji}>📍</Text>
            </View>
            <View style={styles.pinShadow} />
          </View>
          {/* Street lines */}
          <View style={styles.streetH} />
          <View style={styles.streetV} />
          {/* Location dot */}
          <View style={styles.locationDot}>
            <View style={styles.locationDotInner} />
            <View style={styles.locationDotRing} />
          </View>
        </View>

        <Text style={styles.title}>Enable Location Services</Text>
        <Text style={styles.desc}>
          Allow us to access your location to find the best salons near you and provide personalised recommendations.
        </Text>

        <TouchableOpacity
          style={styles.enableBtn}
          onPress={() => {
            setEnabled(true);
            navigation.navigate('MainApp');
          }}>
          <Text style={styles.enableBtnText}>Enable Location Services</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.navigate('MainApp')}>
          <Text style={styles.skipText}>Skip for now</Text>
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
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20 },
  mapIllustration: {
    width: width * 0.8,
    height: width * 0.7,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    marginBottom: 32,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  mapBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8F4FD',
  },
  streetH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#C8DFF0',
    top: '50%',
  },
  streetV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#C8DFF0',
    left: '45%',
  },
  pinContainer: { alignItems: 'center', zIndex: 10 },
  pin: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pinEmoji: { fontSize: 28 },
  pinShadow: {
    width: 20,
    height: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(108,63,197,0.3)',
    marginTop: -4,
  },
  mapGridH1: {},
  mapGridH2: {},
  locationDot: {
    position: 'absolute',
    bottom: 40,
    right: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },
  locationDotRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(108,63,197,0.4)',
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 12 },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  enableBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  enableBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  skipBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  skipText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});
