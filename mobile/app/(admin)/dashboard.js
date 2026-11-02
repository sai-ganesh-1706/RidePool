import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import { driversApi } from '../../src/api/drivers';
import Avatar from '../../src/components/Avatar';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { callNumber } from '../../src/components/DriverCard';
import { EmptyState, ErrorState, Loading } from '../../src/components/StateViews';
import useApi from '../../src/hooks/useApi';
import { colors, spacing } from '../../src/theme';

function PendingDriverCard({ driver, busy, onVerify, onReject }) {
  return (
    <Card>
      <View style={styles.row}>
        <Avatar name={driver.name} size={46} />
        <View style={styles.info}>
          <Text style={styles.name}>{driver.name}</Text>
          <Text style={styles.sub}>
            {driver.phone}
            {driver.vehicleNumber ? ` · ${driver.vehicleNumber}` : ''}
          </Text>
          {driver.addedBy?.name ? <Text style={styles.sub}>Added by {driver.addedBy.name}</Text> : null}
        </View>
      </View>
      <Button title="Call to confirm" icon="call" variant="secondary" onPress={() => callNumber(driver.phone)} />
      <View style={styles.actions}>
        <Button title="Reject" variant="danger" disabled={busy} onPress={onReject} style={styles.action} />
        <Button title="Verify" variant="success" disabled={busy} onPress={onVerify} style={styles.action} />
      </View>
    </Card>
  );
}

export default function AdminDashboardScreen() {
  const { data, loading, error, refreshing, refresh, reload } = useApi(() => driversApi.list(), []);
  const [busyId, setBusyId] = useState(null);

  const pending = (data ?? []).filter((driver) => !driver.isVerified);

  const run = async (driver, action) => {
    setBusyId(driver.id);
    try {
      await action(driver.id);
      await reload();
    } catch (err) {
      Alert.alert('Action failed', getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = (driver) =>
    Alert.alert('Reject driver?', `${driver.name} will be removed from the directory.`, [
      { text: 'Back', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => run(driver, driversApi.reject) },
    ]);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  return (
    <FlatList
      style={styles.list}
      data={pending}
      keyExtractor={(driver) => driver.id}
      contentContainerStyle={styles.content}
      refreshing={refreshing}
      onRefresh={refresh}
      ListHeaderComponent={
        pending.length > 0 ? <Text style={styles.header}>{pending.length} driver(s) waiting for verification</Text> : null
      }
      ListEmptyComponent={
        <EmptyState icon="shield-checkmark-outline" title="All caught up" message="No drivers are waiting for verification." />
      }
      renderItem={({ item }) => (
        <PendingDriverCard
          driver={item}
          busy={busyId === item.id}
          onVerify={() => run(item, driversApi.verify)}
          onReject={() => confirmReject(item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  header: { fontSize: 14, fontWeight: '600', color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
