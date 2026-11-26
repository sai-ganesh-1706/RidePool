import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { radius, spacing, useTheme } from '../theme';

const variantsFor = (colors) => ({
  primary: { bg: colors.primary, fg: colors.onPrimary },
  success: { bg: colors.successSolid, fg: '#FFFFFF' },
  secondary: { bg: colors.primarySoft, fg: colors.primaryText },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  ghost: { bg: 'transparent', fg: colors.muted },
});

export default function Button({ title, onPress, variant = 'primary', icon, loading = false, disabled = false, small = false, style }) {
  const { colors } = useTheme();
  const { bg, fg } = variantsFor(colors)[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      android_ripple={variant === 'ghost' ? undefined : { color: 'rgba(0,0,0,0.08)' }}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        { backgroundColor: bg, opacity: inactive ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={fg} /> : null}
          <Text style={[styles.label, small && styles.smallLabel, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  small: { minHeight: 38, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  label: { fontSize: 16, fontWeight: '700' },
  smallLabel: { fontSize: 14 },
});
