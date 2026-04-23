import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS = [
  { icon: '✏️', label: 'Edit Profile' },
  { icon: '💳', label: 'Payment Methods' },
  { icon: '⭐', label: 'My Reviews' },
  { icon: '❤️', label: 'Favourites' },
  { icon: '🔔', label: 'Notifications' },
  { icon: '🌐', label: 'Language' },
  { icon: '🔒', label: 'Privacy Policy' },
  { icon: '❓', label: 'Help & Support' },
  { icon: '⭐', label: 'Rate the App' },
  { icon: 'ℹ️', label: 'About Us' },
  { icon: '🚪', label: 'Log Out', danger: true },
];

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();
  const displayName = user?.name || 'Guest';
  const displayEmail = user?.email || '';
  const displayPhone = user?.phone || '';
  const initials = displayName.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <Text style={styles.userPhone}>{displayPhone}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Bookings', value: '12' },
            { label: 'Reviews', value: '5' },
            { label: 'Favourites', value: '8' },
          ].map(stat => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, i === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => {
                if (item.label === 'Log Out') { handleLogout(); }
                else if (item.label === 'Edit Profile') { navigation.navigate('EditProfile'); }
                else if (item.label === 'Payment Methods') { navigation.navigate('PaymentMethods'); }
                else if (item.label === 'My Reviews') { navigation.navigate('MyReviews'); }
                else if (item.label === 'Favourites') { navigation.navigate('FavoriteSalons'); }
                else if (item.label === 'Notifications') { navigation.navigate('Notifications'); }
                else if (item.label === 'Language') { navigation.navigate('Language'); }
                else if (item.label === 'Privacy Policy') { navigation.navigate('PrivacyPolicy'); }
                else if (item.label === 'Help & Support') { navigation.navigate('HelpSupport'); }
                else if (item.label === 'Rate the App') { navigation.navigate('RateReview'); }
                else if (item.label === 'About Us') { navigation.navigate('AboutUs'); }
              }}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, item.danger && { color: Colors.red }]}>
                {item.label}
              </Text>
              {!item.danger && <Text style={styles.menuChevron}>›</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: Colors.white, fontSize: 20, fontWeight: '800' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '800', color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  userPhone: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  editBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  editBtnText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  menu: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.greyLight,
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text },
  menuChevron: { fontSize: 18, color: Colors.textSecondary },
});
