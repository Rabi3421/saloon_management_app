import React, { useState } from 'react';
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
import { Colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface Props {
  navigation: any;
}

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      Alert.alert('Validation', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }
    if (!agreed) {
      Alert.alert('Validation', 'Please accept the Terms & Conditions.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
      // Navigation handled automatically by RootNavigator
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Create an account to access all the{'\n'}features in Barber Shop
          </Text>
        </View>

        <View style={styles.card}>
          <Field label="Full Name" value={name} onChange={setName} placeholder="Enter your full name" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="Enter your email" keyboardType="email-address" />
          <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="Enter your phone number" keyboardType="phone-pad" />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={Colors.grey}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Text>{showPass ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Confirm Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              placeholderTextColor={Colors.grey}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
              <Text>{showConfirm ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setAgreed(!agreed)}>
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkText}>
              I agree to the{' '}
              <Text style={styles.checkLink}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.checkLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signUpBtn, loading && { opacity: 0.7 }]}
            onPress={handleSignUp}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.signUpBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>Or Sign up with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            {[
              { icon: 'f', bg: '#1877F2', color: '#fff' },
              { icon: 'G', bg: '#fff', color: '#EA4335', border: true },
              { icon: '🐦', bg: '#fff', color: '#1DA1F2', border: true },
            ].map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.socialBtn, { backgroundColor: s.bg }, s.border && styles.socialBorder]}>
                <Text style={[styles.socialIcon, { color: s.color }]}>{s.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginGrey}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: any;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.grey}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  banner: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: -20,
    zIndex: 1,
  },
  bannerText: { color: Colors.white, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 40,
    flex: 1,
    marginTop: 8,
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
    backgroundColor: Colors.white,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.greyBorder,
    borderRadius: 12,
    paddingRight: 10,
    backgroundColor: Colors.white,
  },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text },
  eyeBtn: { padding: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 16, marginBottom: 20, gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.greyBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkMark: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  checkText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  checkLink: { color: Colors.primary, fontWeight: '600' },
  signUpBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.greyBorder },
  orText: { fontSize: 12, color: Colors.textSecondary, marginHorizontal: 10 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 22 },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  socialBorder: { borderWidth: 1, borderColor: Colors.greyBorder },
  socialIcon: { fontSize: 18, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginGrey: { fontSize: 13, color: Colors.textSecondary },
  loginLink: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
});
