import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ridesApi } from '../../src/api/rides';
import Chip from '../../src/components/Chip';
import RideCard from '../../src/components/RideCard';
import { EmptyState, ErrorState, Loading } from '../../src/components/StateViews';
import useApi from '../../src/hooks/useApi';
import { colors, spacing } from '../../src/theme';

const isUpcoming = (ride) => ride.status === 'OPEN' || ride.status === 'MATCHED';

export default function MyRidesScreen() {
  const [tab, setTab] = useState('upcoming');
  const { data, loading, error, refreshing, refresh, reload } = useApi(() => ridesApi.mine(), []);

  const rides = (data ?? [])
    .filter((ride) => (tab === 'upcoming' ? isUpcoming(ride) : !isUpcoming(ride)))
    .sort((a, b) => (tab === 'upcoming' ? 1 : -1) * (new Date(a.departureTime) - new Date(b.departureTime)));

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Chip label="Upcoming" selected={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <Chip label="Past" selected={tab === 'past'} onPress={() => setTab('past')} />
      </View>

      {loading && !data ? (
        <Loading />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(ride) => ride.id}
          renderItem={({ item }) => <RideCard ride={item} />}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={refresh}
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title={tab === 'upcoming' ? 'No upcoming rides' : 'No past rides'}
              message={tab === 'upcoming' ? 'Join a ride from the board or post your own.' : undefined}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  tabs: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md, flexGrow: 1 },
});
