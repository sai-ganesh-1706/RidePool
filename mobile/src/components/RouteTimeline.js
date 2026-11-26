import { StyleSheet, Text, View } from 'react-native';
import { spacing, useThemedStyles } from '../theme';

/** Vertical "from → to" route with a connecting line – reads cleaner than arrows that wrap. */
export default function RouteTimeline({ from, to, large = false }) {
  const { styles } = useThemedStyles(createStyles);
  const textStyle = large ? styles.large : styles.place;
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={styles.dotFrom} />
        <View style={styles.line} />
        <View style={styles.dotTo} />
      </View>
      <View style={styles.labels}>
        <Text style={textStyle} numberOfLines={1}>{from}</Text>
        <Text style={textStyle} numberOfLines={1}>{to}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, flex: 1 },
  rail: { alignItems: 'center', paddingVertical: 6 },
  dotFrom: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  line: { flex: 1, width: 2, minHeight: 14, backgroundColor: colors.border, marginVertical: 2 },
  dotTo: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.card },
  labels: { flex: 1, justifyContent: 'space-between', gap: spacing.sm },
  place: { fontSize: 16, fontWeight: '700', color: colors.text },
  large: { fontSize: 20, fontWeight: '800', color: colors.text },
});
