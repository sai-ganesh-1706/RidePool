import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import Avatar from '../Avatar';
import Button from '../Button';
import Card from '../Card';
import { callNumber } from '../DriverCard';
import StarRating from '../StarRating';

function Notice({ icon, text }) {
  return (
    <View style={styles.notice}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

/** Shows the assigned driver (with a call button) to riders once the ride is matched. */
export default function DriverPanel({ ride, onChangeDriver }) {
  const { driver, status, isMember, isCreator } = ride;
  const isActive = status === 'OPEN' || status === 'MATCHED';

  if (!isMember) {
    return isActive ? <Notice icon="lock-closed-outline" text="Join this ride to see your driver’s details." /> : null;
  }

  if (driver) {
    return (
      <Card>
        <Text style={styles.heading}>Your auto driver</Text>
        <View style={styles.row}>
          <Avatar name={driver.name} size={52} />
          <View style={styles.info}>
            <Text style={styles.name}>{driver.name}</Text>
            <Text style={styles.sub}>
              {driver.vehicleType.toLowerCase()}
              {driver.vehicleNumber ? ` · ${driver.vehicleNumber}` : ''}
            </Text>
            <Text style={styles.phone}>{driver.phone}</Text>
            <StarRating value={driver.avgRating} count={driver.ratingCount} />
          </View>
        </View>
        {status !== 'CANCELLED' && (
          <Button title={`Call ${driver.name}`} icon="call" variant="success" onPress={() => callNumber(driver.phone)} />
        )}
        {isCreator && isActive && <Button title="Change driver" variant="secondary" onPress={onChangeDriver} />}
      </Card>
    );
  }

  if (status === 'MATCHED') {
    return (
      <Card>
        <Notice icon="alert-circle-outline" text="You’re matched, but no driver is available yet." />
        {isCreator && <Button title="Choose a driver" onPress={onChangeDriver} />}
      </Card>
    );
  }

  if (status === 'OPEN') {
    return <Notice icon="information-circle-outline" text="A driver is assigned automatically as soon as another student joins." />;
  }

  return null;
}

const styles = StyleSheet.create({
  heading: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, textTransform: 'capitalize' },
  phone: { fontSize: 15, fontWeight: '600', color: colors.text },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  noticeText: { flex: 1, fontSize: 14, color: colors.primary },
});
