import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { driversApi } from '../../src/api/drivers';
import DriverCard from '../../src/components/DriverCard';
import { EmptyState, ErrorState, Loading } from '../../src/components/StateViews';
import TextField from '../../src/components/TextField';
import useApi from '../../src/hooks/useApi';
import { colors, spacing } from '../../src/theme';

export default function DriversScreen() {
  const [query, setQuery] = useState('');
  const { data, loading, error, refreshing, refresh, reload } = useApi(() => driversApi.list(), []);

  const drivers = (data ?? []).filter((driver) => driver.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <TextField placeholder="Search drivers" value={query} onChangeText={setQuery} />
      </View>

      {loading && !data ? (
        <Loading />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(driver) => driver.id}
          renderItem={({ item }) => <DriverCard driver={item} />}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={refresh}
          ListEmptyComponent={
            <EmptyState icon="call-outline" title="No drivers found" message="Add a trusted driver with the + button above." />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  search: { padding: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md, flexGrow: 1 },
});
