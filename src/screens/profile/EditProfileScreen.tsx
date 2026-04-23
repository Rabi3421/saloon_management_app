import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { getMyProfile, updateMyProfile } from '../../api/user';

interface Props {
  navigation: any;
}

export default function EditProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getMyProfile();
        setName(profile.name || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyProfile({ name: name.trim(), phone: phone.trim() });
      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = name ? name.substring(0, 2).toUpperCase() : '??';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Avatar */}
          <View style={styles.avatarSection}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <TouchableOpacity style={styles.editAvatarBtn}>
                  <Text style={styles.editAvatarIcon}>📷</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Field label="Full Name" value={name} onChange={setName} />
            <Field label="Email" value={email} onChange={setEmail} keyboardType="email-address" />
            <Field label="Phone Number" value={phone} onChange={setPhone} keyboardType="phone-pad" />
            <Field label="Date of Birth" value={dob} onChange={setDob} />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {['Male', 'Female', 'Other'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(g)}>
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: any;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType || 'default'}
        placeholderTextColor={Colors.grey}
      />
    </>
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
  scroll: { paddingHorizontal: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 28, fontWeight: '800' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: '34%',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  editAvatarIcon: { fontSize: 14 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.text,
  },
  genderRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.greyBorder,
    alignItems: 'center',
  },
  genderBtnActive: { borderColor: Colors.primary, backgroundColor: '#F5F0FF' },
  genderText: { fontSize: 13, color: Colors.textSecondary },
  genderTextActive: { color: Colors.primary, fontWeight: '700' },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});
