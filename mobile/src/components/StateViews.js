import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import Button from './Button';

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function EmptyState({ icon = 'car-outline', title, message }) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={44} color={colors.muted} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={44} color={colors.muted} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && <Button title="Try again" variant="secondary" onPress={onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },
  message: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
