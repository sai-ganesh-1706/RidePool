import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import Button from '../../src/components/Button';
import Screen from '../../src/components/Screen';
import TextField from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme';

const INITIAL = { name: '', email: '', phone: '', hostelBlock: '', roomNumber: '', password: '' };

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));
  const ready = form.name && form.email && form.phone && form.password;

  const submit = async () => {
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Could not create account', getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Screen scroll safe contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create your account</Text>

      <TextField label="Full name" value={form.name} onChangeText={set('name')} autoComplete="name" />
      <TextField label="College email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <TextField label="Phone number" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" autoComplete="tel" />
      <TextField label="Hostel block (optional)" value={form.hostelBlock} onChangeText={set('hostelBlock')} />
      <TextField label="Room number (optional)" value={form.roomNumber} onChangeText={set('roomNumber')} />
      <TextField label="Password (min 8 characters)" value={form.password} onChangeText={set('password')} secureTextEntry />
      <Button title="Sign up" loading={loading} disabled={!ready} onPress={submit} />

      <Text style={styles.footer}>
        Already have an account? <Link href="/login" style={styles.link}>Log in</Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.md },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 15, marginTop: spacing.sm },
  link: { color: colors.primary, fontWeight: '700' },
});
