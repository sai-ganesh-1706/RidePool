import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, spacing, useThemedStyles } from '../theme';

export default function Chip({ label, selected = false, onPress }) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors) => StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  selectedLabel: { color: colors.onPrimary },
});
