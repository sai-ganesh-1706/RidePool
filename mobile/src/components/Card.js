import { StyleSheet, View } from 'react-native';
import { radius, shadow, spacing, useThemedStyles } from '../theme';

export default function Card({ children, style }) {
  const { styles } = useThemedStyles(createStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
});
