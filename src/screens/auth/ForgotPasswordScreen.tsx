import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';

interface Props {
  navigation: any;
}

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(56);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Purple banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Please check your email to take 6 digit{'\n'}code for continue
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* OTP inputs */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={ref => { inputs.current[i] = ref; }}
                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                value={digit}
                onChangeText={val => handleChange(val.slice(-1), i)}
                onKeyPress={e => handleKeyPress(e, i)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>

          {/* Timer */}
          <Text style={styles.timerText}>
            {pad(Math.floor(timer / 60))}:{pad(timer % 60)}
          </Text>
          <View style={styles.resendRow}>
            <Text style={styles.resendGrey}>Didn't receive code? </Text>
            <TouchableOpacity onPress={() => setTimer(60)}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => navigation.navigate('CreateNewPassword')}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 30,
    paddingTop: 48,
    flex: 1,
    marginTop: 8,
    alignItems: 'center',
  },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.greyBorder,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    backgroundColor: Colors.greyLight,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  resendRow: { flexDirection: 'row', marginBottom: 32 },
  resendGrey: { fontSize: 13, color: Colors.textSecondary },
  resendLink: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  sendBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
