import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';

const VARIANTS = {
  primary: { bg: colors.primary, fg: '#FFFFFF' },
  success: { bg: colors.success, fg: '#FFFFFF' },
  secondary: { bg: colors.primarySoft, fg: colors.primary },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

export default function Button({ title, onPress, variant = 'primary', icon, loading = false, disabled = false, style }) {
  const { bg, fg } = VARIANTS[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.base, { backgroundColor: bg, opacity: inactive ? 0.5 : pressed ? 0.85 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={[styles.label, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  label: { fontSize: 16, fontWeight: '600' },
});
