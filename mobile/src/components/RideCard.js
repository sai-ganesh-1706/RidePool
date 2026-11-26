import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useThemedStyles } from '../theme';
import { formatDateTime, rideStatusMeta } from '../utils/format';
import Badge from './Badge';
import Card from './Card';
import RouteTimeline from './RouteTimeline';

function RideCard({ ride }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const router = useRouter();
  const status = rideStatusMeta(ride);
  const riders = ride.maxRiders - ride.seatsLeft;

  return (
    <Pressable onPress={() => router.push(`/ride/${ride.id}`)} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <RouteTimeline from={ride.from.name} to={ride.to.name} />
          <Badge label={status.label} tone={status.tone} />
        </View>

        <View style={styles.footer}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={16} color={colors.muted} />
            <Text style={styles.metaText}>{formatDateTime(ride.departureTime)}</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="people-outline" size={16} color={colors.muted} />
            <Text style={styles.metaText}>
              {riders}/{ride.maxRiders}
            </Text>
          </View>
        </View>

        <Text style={styles.by} numberOfLines={1}>
          by {ride.creator.name}
          {ride.isMember ? '  ·  You’re in' : ''}
        </Text>
      </Card>
    </Pressable>
  );
}

export default memo(RideCard);

const createStyles = (colors) => StyleSheet.create({
  card: { gap: spacing.md },
  pressed: { opacity: 0.92 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  by: { fontSize: 13, color: colors.muted },
});
