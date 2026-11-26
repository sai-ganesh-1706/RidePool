import { StyleSheet, Text, View } from 'react-native';
import { spacing, useThemedStyles } from '../../theme';
import { formatRupees } from '../../utils/format';
import Avatar from '../Avatar';
import Badge from '../Badge';
import Button from '../Button';
import Card from '../Card';

export default function MemberList({ ride, busyUserId, onTogglePayment }) {
  const { styles } = useThemedStyles(createStyles);
  const completed = ride.status === 'COMPLETED';

  return (
    <Card>
      <Text style={styles.heading}>
        Riders · {ride.members.length}/{ride.maxRiders}
      </Text>
      {ride.members.map((member, index) => (
        <View key={member.userId} style={[styles.row, index > 0 && styles.divider]}>
          <Avatar name={member.name} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {member.name}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {[member.isCreator ? 'Organiser' : null, member.hostelBlock].filter(Boolean).join(' · ') || 'Rider'}
            </Text>
          </View>

          {completed && (
            <View style={styles.payment}>
              <Text style={styles.share}>{formatRupees(member.fareShare ?? 0)}</Text>
              {ride.isCreator && !member.isCreator ? (
                <Button
                  title={member.paymentStatus === 'PAID' ? 'Paid ✓' : 'Mark paid'}
                  variant={member.paymentStatus === 'PAID' ? 'secondary' : 'primary'}
                  disabled={busyUserId === member.userId}
                  small
                  onPress={() => onTogglePayment(member)}
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

const createStyles = (colors) => StyleSheet.create({
  heading: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  sub: { fontSize: 13, color: colors.muted },
  payment: { alignItems: 'flex-end', gap: 6 },
  share: { fontSize: 15, fontWeight: '800', color: colors.text },
});
