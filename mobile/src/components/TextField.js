import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function TextField({ label, style, multiline, ...inputProps }) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.muted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
