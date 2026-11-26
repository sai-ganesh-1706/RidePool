import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ridesApi } from '../../src/api/rides';
import Chip from '../../src/components/Chip';
import RideCard from '../../src/components/RideCard';
import { EmptyState, ErrorState, Loading } from '../../src/components/StateViews';
import useApi from '../../src/hooks/useApi';
import { spacing, useThemedStyles } from '../../src/theme';

const isUpcoming = (ride) => ride.status === 'OPEN' || ride.status === 'MATCHED';
const renderRide = ({ item }) => <RideCard ride={item} />;
const rideKey = (ride) => ride.id;

export default function MyRidesScreen() {
  const { styles } = useThemedStyles(createStyles);
  const [tab, setTab] = useState('upcoming');
  const { data, loading, error, refreshing, refresh, reload } = useApi(() => ridesApi.mine(), [], { cacheKey: 'rides:mine' });

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
          keyExtractor={rideKey}
          renderItem={renderRide}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
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

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  tabs: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
});
