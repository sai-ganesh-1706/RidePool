import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { driversApi } from '../../src/api/drivers';
import DriverCard from '../../src/components/DriverCard';
import { EmptyState, ErrorState, Loading } from '../../src/components/StateViews';
import useApi from '../../src/hooks/useApi';
import { radius, spacing, useThemedStyles } from '../../src/theme';

const renderDriver = ({ item }) => <DriverCard driver={item} />;
const driverKey = (driver) => driver.id;

export default function DriversScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
  const [query, setQuery] = useState('');
  const { data, loading, error, refreshing, refresh, reload } = useApi(() => driversApi.list(), [], { cacheKey: 'drivers' });

  const drivers = (data ?? []).filter((driver) => driver.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.faint} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search drivers"
          placeholderTextColor={colors.faint}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {loading && !data ? (
        <Loading />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={driverKey}
          renderItem={renderDriver}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={refresh}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState icon="call-outline" title="No drivers found" message="Add a trusted driver with the + button above." />
          }
        />
      )}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
});
