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
import { colors, radius, spacing } from '../../src/theme';

export default function RideBoardScreen() {
  const router = useRouter();
  const [toLocationId, setToLocationId] = useState(null);

  const locations = useApi(() => locationsApi.list(), []);
  const rides = useApi(() => ridesApi.list(toLocationId ? { toLocationId } : undefined), [toLocationId]);

  return (
    <View style={styles.container}>
      <View>
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
          keyExtractor={(ride) => ride.id}
          renderItem={({ item }) => <RideCard ride={item} />}
          contentContainerStyle={styles.list}
          refreshing={rides.refreshing}
          onRefresh={rides.refresh}
          ListEmptyComponent={
            <EmptyState title="No upcoming rides" message="Be the first — post where you’re headed and others can join." />
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/ride/create')}>
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>New ride</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  filters: { padding: spacing.lg, gap: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 96, gap: spacing.md, flexGrow: 1 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.pill,
    elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
