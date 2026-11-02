import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import Button from '../../src/components/Button';
import Screen from '../../src/components/Screen';
import TextField from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await login({ email, password });
    } catch (err) {
      Alert.alert('Login failed', getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Screen scroll safe contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Ionicons name="car-sport" size={48} color={colors.primary} />
        <Text style={styles.title}>RidePool</Text>
        <Text style={styles.subtitle}>Share autos with your hostel mates</Text>
      </View>

      <TextField label="College email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
      <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
      <Button title="Log in" loading={loading} disabled={!email || !password} onPress={submit} />

      <Text style={styles.footer}>
        New here? <Link href="/register" style={styles.link}>Create an account</Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  title: { fontSize: 30, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted },
  footer: { textAlign: 'center', color: colors.muted, fontSize: 15 },
  link: { color: colors.primary, fontWeight: '700' },
});
