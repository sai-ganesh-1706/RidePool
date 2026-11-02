import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';
import { formatRupees } from '../../utils/format';
import Avatar from '../Avatar';
import Badge from '../Badge';
import Button from '../Button';
import Card from '../Card';

export default function MemberList({ ride, busy, onTogglePayment }) {
  const completed = ride.status === 'COMPLETED';

  return (
    <Card>
      <Text style={styles.heading}>
        Riders ({ride.members.length}/{ride.maxRiders})
      </Text>
      {ride.members.map((member) => (
        <View key={member.userId} style={styles.row}>
          <Avatar name={member.name} />
          <View style={styles.info}>
            <Text style={styles.name}>
              {member.name}
              {member.isCreator ? '  · organiser' : ''}
            </Text>
            {member.hostelBlock ? <Text style={styles.sub}>{member.hostelBlock}</Text> : null}
          </View>

          {completed && (
            <View style={styles.payment}>
              <Text style={styles.share}>{formatRupees(member.fareShare ?? 0)}</Text>
              {ride.isCreator && !member.isCreator ? (
                <Button
                  title={member.paymentStatus === 'PAID' ? 'Paid ✓' : 'Mark paid'}
                  variant={member.paymentStatus === 'PAID' ? 'secondary' : 'primary'}
                  disabled={busy}
                  onPress={() => onTogglePayment(member)}
                  style={styles.smallButton}
                />
              ) : (
                <Badge
                  label={member.paymentStatus === 'PAID' ? 'Paid' : 'Pending'}
                  tone={member.paymentStatus === 'PAID' ? 'success' : 'warning'}
                />
              )}
            </View>
          )}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  sub: { fontSize: 13, color: colors.muted },
  payment: { alignItems: 'flex-end', gap: 4 },
  share: { fontSize: 15, fontWeight: '700', color: colors.text },
  smallButton: { minHeight: 34, paddingHorizontal: spacing.md },
});
