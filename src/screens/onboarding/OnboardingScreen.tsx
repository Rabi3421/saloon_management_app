import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '💇‍♀️',
    title: 'Explore Barber Shops\nNear You',
    desc: 'Discover the best salons and barber shops in your area with just a tap.',
    bg: '#F3EFFF',
  },
  {
    id: '2',
    emoji: '📅',
    title: 'Book Your Favorite Bar\nOrder Now',
    desc: 'Schedule appointments at your favorite salons anytime, anywhere.',
    bg: '#EFF6FF',
  },
  {
    id: '3',
    emoji: '✂️',
    title: "Let's Make Your Hair\nMore Style",
    desc: 'Get the best hair styles and treatments from professional stylists.',
    bg: '#F3EFFF',
  },
];

interface Props {
  navigation: any;
}

export default function OnboardingScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  return (
    <SafeAreaView style={styles.root}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>✂</Text>
        </View>
        <Text style={styles.logoName}>SALOON</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.illustration, { backgroundColor: item.bg }]}>
              <Text style={styles.illustrationEmoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDesc}>{item.desc}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sign up */}
      <View style={styles.signupRow}>
        <Text style={styles.signupGrey}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 18, color: Colors.white },
  logoName: { fontSize: 16, fontWeight: '800', color: Colors.primary, letterSpacing: 2 },
  slide: { alignItems: 'center', paddingHorizontal: 24 },
  illustration: {
    width: width * 0.75,
    height: width * 0.65,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  illustrationEmoji: { fontSize: 96 },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 14,
  },
  slideDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 20 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.greyBorder,
  },
  dotActive: { backgroundColor: Colors.primary, width: 24, borderRadius: 4 },
  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  skipBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  nextBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  signupGrey: { fontSize: 13, color: Colors.textSecondary },
  signupLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
});
