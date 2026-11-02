import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { driversApi } from '../../../src/api/drivers';
import { getErrorMessage } from '../../../src/api/client';
import { ridesApi } from '../../../src/api/rides';
import Badge from '../../../src/components/Badge';
import Button from '../../../src/components/Button';
import Card from '../../../src/components/Card';
import DriverPanel from '../../../src/components/ride/DriverPanel';
import DriverPickerModal from '../../../src/components/ride/DriverPickerModal';
import FareModal from '../../../src/components/ride/FareModal';
import MemberList from '../../../src/components/ride/MemberList';
import RateDriverModal from '../../../src/components/ride/RateDriverModal';
import Screen from '../../../src/components/Screen';
import { ErrorState, Loading } from '../../../src/components/StateViews';
import { useAuth } from '../../../src/context/AuthContext';
import useApi from '../../../src/hooks/useApi';
import { colors, spacing } from '../../../src/theme';
import { formatDateTime, formatRupees, rideStatusMeta } from '../../../src/utils/format';

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data: ride, loading, error, refreshing, refresh, reload } = useApi(() => ridesApi.get(id), [id]);

  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null); // 'fare' | 'driver' | 'rate'

  if (loading && !ride) return <Loading />;
  if (error && !ride) return <ErrorState message={error} onRetry={reload} />;

  const isActive = ride.status === 'OPEN' || ride.status === 'MATCHED';
  const status = rideStatusMeta(ride);
  const myShare = ride.members.find((member) => member.userId === user.id)?.fareShare;

  const run = async (action, { successMessage, onDone } = {}) => {
    setBusy(true);
    try {
      await action();
      await reload();
      setModal(null);
      if (successMessage) Alert.alert(successMessage);
      onDone?.();
    } catch (err) {
      Alert.alert('Couldn’t do that', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const confirm = (title, message, onConfirm) =>
    Alert.alert(title, message, [
      { text: 'Back', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: onConfirm },
    ]);

  return (
    <Screen scroll refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <Card>
        <View style={styles.titleRow}>
          <Text style={styles.route}>
            {ride.from.name} → {ride.to.name}
          </Text>
          <Badge label={status.label} tone={status.tone} />
        </View>
        <View style={styles.meta}>
          <Ionicons name="time-outline" size={18} color={colors.muted} />
          <Text style={styles.metaText}>{formatDateTime(ride.departureTime)}</Text>
        </View>
        {ride.notes ? (
          <View style={styles.meta}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color={colors.muted} />
            <Text style={styles.metaText}>{ride.notes}</Text>
          </View>
        ) : null}
        {ride.status === 'COMPLETED' && (
          <Text style={styles.fare}>
            Total fare {formatRupees(ride.totalFare)}
            {ride.isMember && myShare !== null ? ` · Your share ${formatRupees(myShare)}` : ''}
          </Text>
        )}
      </Card>

      <DriverPanel ride={ride} onChangeDriver={() => setModal('driver')} />

      <MemberList
        ride={ride}
        busy={busy}
        onTogglePayment={(member) =>
          run(() => ridesApi.setPayment(ride.id, member.userId, member.paymentStatus === 'PAID' ? 'PENDING' : 'PAID'))
        }
      />

      {isActive && !ride.isMember &&
        (ride.seatsLeft > 0 ? (
          <Button title="Join this ride" loading={busy} onPress={() => run(() => ridesApi.join(ride.id))} />
        ) : (
          <Text style={styles.full}>This ride is full.</Text>
        ))}

      {ride.isMember && (
        <Button title="Open ride chat" icon="chatbubbles-outline" variant="secondary" onPress={() => router.push(`/ride/${ride.id}/chat`)} />
      )}

      {ride.status === 'COMPLETED' && ride.isMember && ride.driver && (
        <Button title={`Rate ${ride.driver.name}`} icon="star-outline" variant="secondary" onPress={() => setModal('rate')} />
      )}

      {isActive && ride.isCreator && (
        <Button title="Complete ride & split fare" icon="checkmark-circle-outline" variant="success" onPress={() => setModal('fare')} />
      )}

      {isActive && ride.isMember && !ride.isCreator && (
        <Button
          title="Leave ride"
          variant="danger"
          disabled={busy}
          onPress={() => confirm('Leave this ride?', 'Your seat will be given up.', () => run(() => ridesApi.leave(ride.id)))}
        />
      )}

      {isActive && ride.isCreator && (
        <Button
          title="Cancel ride"
          variant="danger"
          disabled={busy}
          onPress={() => confirm('Cancel this ride?', 'All riders will lose the ride.', () => run(() => ridesApi.cancel(ride.id)))}
        />
      )}

      <FareModal
        visible={modal === 'fare'}
        riderCount={ride.members.length}
        loading={busy}
        onClose={() => setModal(null)}
        onSubmit={(total) => run(() => ridesApi.complete(ride.id, total), { successMessage: 'Ride completed 🎉' })}
      />
      <DriverPickerModal
        visible={modal === 'driver'}
        onClose={() => setModal(null)}
        onPick={(driver) => run(() => ridesApi.setDriver(ride.id, driver.id))}
      />
      {ride.driver && (
        <RateDriverModal
          visible={modal === 'rate'}
          driverName={ride.driver.name}
          loading={busy}
          onClose={() => setModal(null)}
          onSubmit={(body) => run(() => driversApi.rate(ride.driver.id, body), { successMessage: 'Thanks for rating!' })}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { gap: spacing.sm },
  route: { fontSize: 20, fontWeight: '800', color: colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { flex: 1, fontSize: 15, color: colors.text },
  fare: { fontSize: 15, fontWeight: '700', color: colors.success, marginTop: spacing.xs },
  full: { textAlign: 'center', color: colors.warning, fontWeight: '600' },
});
