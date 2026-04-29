import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

export default function StaffProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const stackNav = navigation.getParent();
  const go = (screen: string) => stackNav?.navigate(screen);

  const initials = (user?.name || 'S')
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to logout from the staff dashboard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => logout() },
    ]);
  };

  const menuItems = [
    { icon: '📋', label: 'My Bookings', action: () => navigation.navigate('StaffBookingsTab') },
    { icon: '✂️', label: 'Services', action: () => navigation.navigate('StaffServicesTab') },
    { icon: '🔔', label: 'Notifications', action: () => go('StaffNotifications') },
    { icon: '❓', label: 'Help & Support', action: () => go('HelpSupport') },
    { icon: '📄', label: 'Privacy Policy', action: () => go('PrivacyPolicy') },
    { icon: 'ℹ️', label: 'About Us', action: () => go('AboutUs') },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <Text style={styles.name}>{user?.name || 'Staff'}</Text>
          <View style={styles.roleBadge}><Text style={styles.roleText}>👤 Staff Member</Text></View>
          <Text style={styles.email}>{user?.email}</Text>
          {!!user?.phone && <Text style={styles.phone}>📞 {user.phone}</Text>}
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={item.label} style={[styles.menuRow, index < menuItems.length - 1 && styles.menuRowBorder]} onPress={item.action}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 82, height: 82, borderRadius: 41, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text },
  roleBadge: { backgroundColor: Colors.primary + '20', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6, marginBottom: 8 },
  roleText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  email: { fontSize: 13, color: Colors.textSecondary },
  phone: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  menuCard: { backgroundColor: Colors.white, borderRadius: 20, marginHorizontal: 16, paddingHorizontal: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.greyBorder },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
  menuChevron: { fontSize: 20, color: Colors.grey },
  logoutBtn: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});