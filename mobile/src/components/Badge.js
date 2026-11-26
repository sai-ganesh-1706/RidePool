import { StyleSheet, Text, View } from 'react-native';
import { radius, useTheme } from '../theme';

const tonesFor = (colors) => ({
  primary: { bg: colors.primarySoft, fg: colors.primaryText },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  muted: { bg: colors.border, fg: colors.muted },
});

export default function Badge({ label, tone = 'muted' }) {
  const { colors } = useTheme();
  const { bg, fg } = tonesFor(colors)[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  label: { fontSize: 12, fontWeight: '700' },
});
