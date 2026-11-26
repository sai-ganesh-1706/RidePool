import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useThemedStyles } from '../theme';

/** Form-level error shown right above the submit button (no blocking pop-up). */
export default function InlineError({ message }) {
  const { colors, styles } = useThemedStyles(createStyles);
  if (!message) return null;
  return (
    <View style={styles.box}>
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  box: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', backgroundColor: colors.dangerSoft, padding: spacing.md, borderRadius: radius.md },
  text: { flex: 1, fontSize: 14, color: colors.danger, fontWeight: '500' },
});
