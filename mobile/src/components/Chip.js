import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function Chip({ label, selected = false, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: 14, fontWeight: '500', color: colors.text },
  selectedLabel: { color: '#FFFFFF' },
});
