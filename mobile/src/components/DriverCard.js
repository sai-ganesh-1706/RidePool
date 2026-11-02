import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import Avatar from './Avatar';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';
import StarRating from './StarRating';

export const callNumber = (phone) => Linking.openURL(`tel:${phone}`);

export default function DriverCard({ driver }) {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push(`/driver/${driver.id}`)}>
      <Card>
        <View style={styles.row}>
          <Avatar name={driver.name} size={46} />
          <View style={styles.info}>
            <Text style={styles.name}>{driver.name}</Text>
            <Text style={styles.sub}>
              {driver.vehicleType.toLowerCase()}
              {driver.vehicleNumber ? ` · ${driver.vehicleNumber}` : ''}
            </Text>
            <StarRating value={driver.avgRating} count={driver.ratingCount} />
          </View>
        </View>
        <View style={styles.footer}>
          {!driver.isVerified ? <Badge label="Pending verification" tone="warning" /> : <View />}
          <Button title="Call" icon="call" onPress={() => callNumber(driver.phone)} style={styles.call} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, textTransform: 'capitalize' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  call: { minHeight: 40, paddingHorizontal: spacing.lg },
});
