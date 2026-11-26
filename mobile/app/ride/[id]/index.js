import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../../src/api/client';
import { driversApi } from '../../../src/api/drivers';
import { ridesApi } from '../../../src/api/rides';
import Badge from '../../../src/components/Badge';
import Button from '../../../src/components/Button';
import Card from '../../../src/components/Card';
import DriverPanel from '../../../src/components/ride/DriverPanel';
import DriverPickerModal from '../../../src/components/ride/DriverPickerModal';
import FareModal from '../../../src/components/ride/FareModal';
import MemberList from '../../../src/components/ride/MemberList';
import RateDriverModal from '../../../src/components/ride/RateDriverModal';
import SettlementCard from '../../../src/components/ride/SettlementCard';
import RouteTimeline from '../../../src/components/RouteTimeline';
import Screen from '../../../src/components/Screen';
import { ErrorState, Loading } from '../../../src/components/StateViews';
import { useToast } from '../../../src/components/Toast';
import { useAuth } from '../../../src/context/AuthContext';
import useApi from '../../../src/hooks/useApi';
import { spacing, useThemedStyles } from '../../../src/theme';
import { formatDateTime, rideStatusMeta } from '../../../src/utils/format';

export default function RideDetailScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const {
    data: ride,
    loading,
    error,
    refreshing,
    refresh,
    reload,
    setData,
  } = useApi(() => ridesApi.get(id), [id], { cacheKey: `ride:${id}` });

  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null); // 'fare' | 'editFare' | 'driver' | 'rate'
  const [payingUserId, setPayingUserId] = useState(null);

  if (loading && !ride) return <Loading />;
  if (error && !ride) return <ErrorState message={error} onRetry={reload} />;

  const isActive = ride.status === 'OPEN' || ride.status === 'MATCHED';
  const status = rideStatusMeta(ride);
  const riderCount = ride.members.length;

  /**
   * Runs an action. Every ride action already returns the updated ride, so we use that directly
   * instead of re-fetching (one round trip instead of two).
   */
  const run = async (action, { success } = {}) => {
    setBusy(true);
    try {
      const result = await action();
      if (result?.members) setData(result);
      setModal(null);
      if (success) toast(success);
    } catch (err) {
      Alert.alert('Couldn’t do that', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  /** Flips the paid badge immediately and rolls back if the server says no. */
  const togglePayment = async (member) => {
    const next = member.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
    const previous = ride;
    setPayingUserId(member.userId);
    setData((current) => ({
      ...current,
      members: current.members.map((m) => (m.userId === member.userId ? { ...m, paymentStatus: next } : m)),
    }));
    try {
      setData(await ridesApi.setPayment(ride.id, member.userId, next));
    } catch (err) {
      setData(previous);
      Alert.alert('Couldn’t update payment', getErrorMessage(err));
    } finally {
      setPayingUserId(null);
    }
  };

  const confirm = (title, message, confirmLabel, onConfirm) =>
    Alert.alert(title, message, [
      { text: 'Back', style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: onConfirm },
    ]);

  return (
    <Screen scroll refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <Card>
        <View style={styles.titleRow}>
          <RouteTimeline from={ride.from.name} to={ride.to.name} large />
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
      </Card>

      {ride.status === 'COMPLETED' && ride.isMember && (
        <SettlementCard ride={ride} userId={user.id} onEditFare={() => setModal('editFare')} />
      )}

      <DriverPanel ride={ride} onChangeDriver={() => setModal('driver')} />

      <MemberList ride={ride} busyUserId={payingUserId} onTogglePayment={togglePayment} />

      {isActive && !ride.isMember &&
        (ride.seatsLeft > 0 ? (
          <Button title="Join this ride" loading={busy} onPress={() => run(() => ridesApi.join(ride.id), { success: 'You joined the ride' })} />
        ) : (
          <Text style={styles.full}>This ride is full.</Text>
        ))}

      {ride.isMember && (
        <Button title="Open ride chat" icon="chatbubbles-outline" variant="secondary" onPress={() => router.push(`/ride/${ride.id}/chat`)} />
      )}

      {ride.status === 'COMPLETED' && ride.isMember && ride.driver && (
        <Button title={`Rate ${ride.driver.name}`} icon="star-outline" variant="secondary" onPress={() => setModal('rate')} />
      )}

      {isActive && ride.isCreator &&
        (riderCount >= 2 ? (
          <Button title="Complete ride & split fare" icon="checkmark-circle-outline" variant="success" onPress={() => setModal('fare')} />
        ) : (
          <Text style={styles.hint}>Once another student joins, you can complete the ride and split the fare here.</Text>
        ))}

      {isActive && ride.isMember && !ride.isCreator && (
        <Button
          title="Leave ride"
          variant="danger"
          disabled={busy}
          onPress={() =>
            confirm('Leave this ride?', 'Your seat will be given up.', 'Leave', () =>
              run(() => ridesApi.leave(ride.id), { success: 'You left the ride' }),
            )
          }
        />
      )}

      {isActive && ride.isCreator && (
        <Button
          title="Cancel ride"
          variant="danger"
          disabled={busy}
          onPress={() =>
            confirm('Cancel this ride?', 'All riders will lose the ride.', 'Cancel ride', () =>
              run(() => ridesApi.cancel(ride.id), { success: 'Ride cancelled' }),
            )
          }
        />
      )}

      <FareModal
        visible={modal === 'fare' || modal === 'editFare'}
        editing={modal === 'editFare'}
        initialFare={modal === 'editFare' ? ride.totalFare : undefined}
        riderCount={riderCount}
        loading={busy}
        onClose={() => setModal(null)}
        onSubmit={(total) =>
          modal === 'editFare'
            ? run(() => ridesApi.updateFare(ride.id, total), { success: 'Fare updated' })
            : run(() => ridesApi.complete(ride.id, total), { success: 'Ride completed 🎉' })
        }
      />
      <DriverPickerModal
        visible={modal === 'driver'}
        onClose={() => setModal(null)}
        onPick={(driver) => run(() => ridesApi.setDriver(ride.id, driver.id), { success: `${driver.name} assigned` })}
      />
      {ride.driver && (
        <RateDriverModal
          visible={modal === 'rate'}
          driverName={ride.driver.name}
          loading={busy}
          onClose={() => setModal(null)}
          onSubmit={(body) => run(() => driversApi.rate(ride.driver.id, body), { success: 'Thanks for rating!' })}
        />
      )}
    </Screen>
  );
}

const createStyles = (colors) => StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaText: { flex: 1, fontSize: 15, color: colors.textSoft },
  full: { textAlign: 'center', color: colors.warning, fontWeight: '600' },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 13, lineHeight: 19 },
});
