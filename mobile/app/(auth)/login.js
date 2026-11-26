import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import Button from '../../src/components/Button';
import InlineError from '../../src/components/InlineError';
import Screen from '../../src/components/Screen';
import TextField from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { radius, shadowStrong, spacing, useThemedStyles } from '../../src/theme';

export default function LoginScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
  const { login } = useAuth();
  const passwordRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ready = Boolean(email.trim() && password);

  const submit = async () => {
    if (!ready || loading) return;
    setLoading(true);
    setError('');
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Screen scroll safe contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="car-sport" size={34} color={colors.onPrimary} />
        </View>
        <Text style={styles.title}>RidePool</Text>
        <Text style={styles.subtitle}>Share autos with your hostel mates</Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="College email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
        />
        <TextField
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <InlineError message={error} />
        <Button title="Log in" loading={loading} disabled={!ready} onPress={submit} />
      </View>

      <Text style={styles.footer}>
        New here? <Link href="/register" style={styles.link}>Create an account</Link>
      </Text>
    </Screen>
  );
}

const createStyles = (colors) => StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.xs },
  logo: { width: 68, height: 68, borderRadius: radius.xl, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm, ...shadowStrong },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted },
  form: { gap: spacing.lg },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 15 },
  link: { color: colors.primaryText, fontWeight: '700' },
});
