import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { locationsApi } from '../../src/api/locations';
import { ridesApi } from '../../src/api/rides';
import Chip from '../../src/components/Chip';
import RideCard from '../../src/components/RideCard';
import { EmptyState, ErrorState, Loading } from '../../src/components/StateViews';
import useApi from '../../src/hooks/useApi';
import { radius, shadowStrong, spacing, useThemedStyles } from '../../src/theme';

const renderRide = ({ item }) => <RideCard ride={item} />;
const rideKey = (ride) => ride.id;

export default function RideBoardScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
  const router = useRouter();
  const [toLocationId, setToLocationId] = useState(null);

  const locations = useApi(() => locationsApi.list(), [], { cacheKey: 'locations' });
  const rides = useApi(() => ridesApi.list(toLocationId ? { toLocationId } : undefined), [toLocationId], {
    cacheKey: `rides:board:${toLocationId ?? 'all'}`,
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <Chip label="All destinations" selected={!toLocationId} onPress={() => setToLocationId(null)} />
          {(locations.data ?? []).map((location) => (
            <Chip
              key={location.id}
              label={location.name}
              selected={toLocationId === location.id}
              onPress={() => setToLocationId(location.id)}
            />
          ))}
        </ScrollView>
      </View>

      {rides.loading && !rides.data ? (
        <Loading />
      ) : rides.error && !rides.data ? (
        <ErrorState message={rides.error} onRetry={rides.reload} />
      ) : (
        <FlatList
          data={rides.data}
          keyExtractor={rideKey}
          renderItem={renderRide}
          contentContainerStyle={styles.list}
          refreshing={rides.refreshing}
          onRefresh={rides.refresh}
          initialNumToRender={6}
          windowSize={7}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState title="No upcoming rides" message="Be the first — post where you’re headed and others can join." />
          }
        />
      )}

      <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={() => router.push('/ride/create')}>
        <Ionicons name="add" size={22} color={colors.onPrimary} />
        <Text style={styles.fabText}>New ride</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  filterBar: { backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  filters: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  list: { padding: spacing.lg, paddingBottom: 100, gap: spacing.md, flexGrow: 1 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 15,
    borderRadius: radius.pill,
    ...shadowStrong,
  },
  fabPressed: { transform: [{ scale: 0.97 }] },
  fabText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
});
