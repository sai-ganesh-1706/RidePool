import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useThemedStyles } from '../../theme';
import { formatRupees } from '../../utils/format';
import Button from '../Button';
import Card from '../Card';

/**
 * Fare summary shown after a ride is completed:
 *  - organiser: total, how much has been collected, and the option to fix a typo
 *  - rider: exactly what they owe and to whom
 */
export default function SettlementCard({ ride, userId, onEditFare }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const me = ride.members.find((member) => member.userId === userId);
  const others = ride.members.filter((member) => !member.isCreator);
  const collected = others.filter((member) => member.paymentStatus === 'PAID').reduce((sum, member) => sum + (member.fareShare ?? 0), 0);
  const expected = others.reduce((sum, member) => sum + (member.fareShare ?? 0), 0);
  const allPaid = expected > 0 && collected >= expected;
  const nobodyPaidYet = others.every((member) => member.paymentStatus !== 'PAID');
  const progress = expected > 0 ? Math.min(collected / expected, 1) : 0;

  return (
    <Card>
      <Text style={styles.heading}>Fare</Text>
      <View style={styles.totalRow}>
        <Text style={styles.total}>{formatRupees(ride.totalFare)}</Text>
        <Text style={styles.totalSub}>total paid to the driver</Text>
      </View>

      {ride.isCreator ? (
        <>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }, allPaid && styles.fillDone]} />
          </View>
          <Text style={styles.line}>
            {allPaid ? 'Everyone has paid you back 🎉' : `Collected ${formatRupees(collected)} of ${formatRupees(expected)}`}
          </Text>
          {nobodyPaidYet && <Button title="Edit fare" icon="create-outline" variant="secondary" small onPress={onEditFare} />}
        </>
      ) : me ? (
        <View style={[styles.owe, me.paymentStatus === 'PAID' ? styles.oweDone : styles.oweDue]}>
          <Ionicons
            name={me.paymentStatus === 'PAID' ? 'checkmark-circle' : 'wallet-outline'}
            size={22}
            color={me.paymentStatus === 'PAID' ? colors.success : colors.warning}
          />
          <Text style={[styles.oweText, { color: me.paymentStatus === 'PAID' ? colors.success : colors.warning }]}>
            {me.paymentStatus === 'PAID'
              ? `You’ve paid your ${formatRupees(me.fareShare ?? 0)} share`
              : `Pay ${ride.creator.name} ${formatRupees(me.fareShare ?? 0)}`}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const createStyles = (colors) => StyleSheet.create({
  heading: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  total: { fontSize: 30, fontWeight: '800', color: colors.text },
  totalSub: { fontSize: 13, color: colors.muted },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.bg, overflow: 'hidden', marginTop: spacing.xs },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  fillDone: { backgroundColor: colors.success },
  line: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  owe: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  oweDue: { backgroundColor: colors.warningSoft },
  oweDone: { backgroundColor: colors.successSoft },
  oweText: { flex: 1, fontSize: 15, fontWeight: '700' },
});
