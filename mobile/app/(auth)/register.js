import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import Button from '../../src/components/Button';
import InlineError from '../../src/components/InlineError';
import Screen from '../../src/components/Screen';
import TextField from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { spacing, useThemedStyles } from '../../src/theme';

const INITIAL = { name: '', email: '', phone: '', hostelBlock: '', roomNumber: '', password: '' };

export default function RegisterScreen() {
  const { styles } = useThemedStyles(createStyles);
  const { register } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));
  const ready = form.name.trim() && form.email.trim() && form.phone.trim() && form.password.length >= 8;

  const submit = async () => {
    if (!ready || loading) return;
    setLoading(true);
    setError('');
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Screen scroll safe contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>It takes less than a minute.</Text>
      </View>

      <View style={styles.form}>
        <TextField label="Full name" value={form.name} onChangeText={set('name')} autoComplete="name" autoCapitalize="words" />
        <TextField label="College email" value={form.email} onChangeText={set('email')} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" />
        <TextField label="Phone number" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" autoComplete="tel" />
        <View style={styles.pair}>
          <View style={styles.half}>
            <TextField label="Hostel block" placeholder="Optional" value={form.hostelBlock} onChangeText={set('hostelBlock')} />
          </View>
          <View style={styles.half}>
            <TextField label="Room no." placeholder="Optional" value={form.roomNumber} onChangeText={set('roomNumber')} />
          </View>
        </View>
        <TextField
          label="Password"
          value={form.password}
          onChangeText={set('password')}
          secureTextEntry
          hint="At least 8 characters"
          error={form.password.length > 0 && form.password.length < 8 ? 'Use at least 8 characters' : undefined}
        />
        <InlineError message={error} />
        <Button title="Sign up" loading={loading} disabled={!ready} onPress={submit} />
      </View>

      <Text style={styles.footer}>
        Already have an account? <Link href="/login" style={styles.link}>Log in</Link>
      </Text>
    </Screen>
  );
}

const createStyles = (colors) => StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 2 },
  form: { gap: spacing.lg },
  pair: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 15 },
  link: { color: colors.primaryText, fontWeight: '700' },
});
