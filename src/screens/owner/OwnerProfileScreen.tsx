import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

export default function OwnerProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  // navigation prop here belongs to the Tab navigator.
  // To push screens onto the parent OwnerStack we use getParent().
  const stackNav = navigation.getParent();
  const go = (screen: string) => stackNav?.navigate(screen);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  const menuItems = [
    { icon: '🏪', label: 'Salon Profile', action: () => go('OwnerSalonProfile') },
    { icon: '🧑‍🤝‍🧑', label: 'Customers', action: () => go('OwnerCustomers') },
    { icon: '💬', label: 'Messages', action: () => go('OwnerMessages') },
    { icon: '🔔', label: 'Notifications', action: () => go('OwnerNotifications') },
    { icon: '🔒', label: 'Change Password', action: () => Alert.alert('Coming Soon', 'Change password coming soon') },
    { icon: '❓', label: 'Help & Support', action: () => go('HelpSupport') },
    { icon: '📄', label: 'Privacy Policy', action: () => go('PrivacyPolicy') },
    { icon: 'ℹ️', label: 'About Us', action: () => go('AboutUs') },
  ];

  const initials = (user?.name || 'O')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Owner'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>🏪 Salon Owner</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.phone && <Text style={styles.phone}>📞 {user.phone}</Text>}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, i < menuItems.length - 1 && styles.menuRowBorder]}
              onPress={item.action}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text },
  roleBadge: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
    marginBottom: 8,
  },
  roleText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  email: { fontSize: 13, color: Colors.textSecondary },
  phone: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    paddingHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.greyBorder },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
  menuChevron: { fontSize: 20, color: Colors.grey },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
