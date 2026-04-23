import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getFavourites, removeFavourite, FavouriteSalon } from '../../api/favourites';

interface Props {
  navigation: any;
}

export default function FavoriteSalonsScreen({ navigation }: Props) {
  const [favorites, setFavorites] = useState<FavouriteSalon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFavourites();
      setFavorites(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load favourites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (item: FavouriteSalon) => {
    const targetId = item.salonId || item._id;
    try {
      await removeFavourite(targetId);
      setFavorites(prev => prev.filter(s => (s.salonId || s._id) !== targetId));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to remove favourite');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SalonDetail', { salon: item })}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name || item.salonName || 'Salon'}</Text>
        <Text style={styles.address} numberOfLines={1}>📍 {item.address}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.rating}>⭐ {item.rating}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.distance}>{item.distance} away</Text>
        </View>
        <Text style={styles.price}>From ${item.priceRange?.split('-')[0] || '20'}</Text>
      </View>
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => handleRemove(item)}>
        <Text style={styles.heart}>❤️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favourite Salons</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />
      ) : favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🤍</Text>
          <Text style={styles.emptyTitle}>No Favourites Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any salon to save it here.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('SalonList')}>
            <Text style={styles.exploreBtnText}>Explore Salons</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  image: { width: 90, height: 100 },
  info: { flex: 1, padding: 10, justifyContent: 'space-between' },
  name: { fontSize: 14, fontWeight: '700', color: Colors.black },
  address: { fontSize: 11, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 12, color: Colors.text },
  dot: { color: Colors.grey },
  distance: { fontSize: 12, color: Colors.textSecondary },
  price: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  heartBtn: { padding: 12, justifyContent: 'center' },
  heart: { fontSize: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.black, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  exploreBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  exploreBtnText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});
