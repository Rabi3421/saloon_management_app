import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getMyReviews, Review } from '../../api/reviews';

interface Props {
  navigation: any;
}

export default function MyReviewsScreen({ navigation }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyReviews();
        setReviews(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />
      ) : (
      <FlatList
        data={reviews}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48 }}>⭐</Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, marginTop: 12 }}>No reviews yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.salonAvatar}>
                <Text style={styles.salonAvatarText}>{(item.salonName || 'S')[0]}</Text>
              </View>
              <View style={styles.salonInfo}>
                <Text style={styles.salonName}>{item.salonName || 'Salon'}</Text>
                <Text style={styles.serviceName}>{item.serviceName || ''}</Text>
              </View>
              <Text style={styles.date}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
            </View>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Text key={i} style={[styles.star, i < item.rating ? styles.starFilled : styles.starEmpty]}>
                  ★
                </Text>
              ))}
              <Text style={styles.ratingNumber}>{item.rating}.0</Text>
            </View>
            <Text style={styles.comment}>{item.comment}</Text>
          </View>
        )}
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
  list: { paddingHorizontal: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  salonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salonAvatarText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  salonInfo: { flex: 1 },
  salonName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  serviceName: { fontSize: 12, color: Colors.textSecondary },
  date: { fontSize: 11, color: Colors.textSecondary },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 2 },
  star: { fontSize: 18 },
  starFilled: { color: Colors.star },
  starEmpty: { color: Colors.greyBorder },
  ratingNumber: { fontSize: 13, color: Colors.text, fontWeight: '700', marginLeft: 4 },
  comment: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  cardActions: { flexDirection: 'row', gap: 10 },
  editBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  editBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  deleteBtn: {
    borderWidth: 1.5,
    borderColor: Colors.red,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  deleteBtnText: { color: Colors.red, fontSize: 13, fontWeight: '600' },
});
