import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useThemedStyles } from '../theme';
import Button from './Button';

export function Loading() {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function IconBubble({ name }) {
  const { colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.bubble}>
      <Ionicons name={name} size={32} color={colors.primaryText} />
    </View>
  );
}

export function EmptyState({ icon = 'car-outline', title, message }) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.center}>
      <IconBubble name={icon} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.center}>
      <IconBubble name="cloud-offline-outline" />
      <Text style={styles.title}>Couldn’t load this</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} style={styles.retry} /> : null}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  bubble: { width: 72, height: 72, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },
  message: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  retry: { marginTop: spacing.sm, minWidth: 140 },
});
