import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { formatDateTime, rideStatusMeta } from '../utils/format';
import Badge from './Badge';
import Card from './Card';

export default function RideCard({ ride }) {
  const router = useRouter();
  const status = rideStatusMeta(ride);
  const riders = ride.maxRiders - ride.seatsLeft;

  return (
    <Pressable onPress={() => router.push(`/ride/${ride.id}`)}>
      <Card>
        <View style={styles.header}>
          <View style={styles.route}>
            <Text style={styles.place} numberOfLines={1}>{ride.from.name}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.muted} />
            <Text style={styles.place} numberOfLines={1}>{ride.to.name}</Text>
          </View>
          <Badge label={status.label} tone={status.tone} />
        </View>

        <View style={styles.meta}>
          <Ionicons name="time-outline" size={16} color={colors.muted} />
          <Text style={styles.metaText}>{formatDateTime(ride.departureTime)}</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons name="people-outline" size={16} color={colors.muted} />
          <Text style={styles.metaText}>
            {riders}/{ride.maxRiders} riders · by {ride.creator.name}
            {ride.isMember ? ' · You’re in' : ''}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  route: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  place: { fontSize: 16, fontWeight: '700', color: colors.text, flexShrink: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: colors.muted },
});
