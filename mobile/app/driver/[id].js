import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import { driversApi } from '../../src/api/drivers';
import Avatar from '../../src/components/Avatar';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import { callNumber } from '../../src/components/DriverCard';
import Screen from '../../src/components/Screen';
import StarRating from '../../src/components/StarRating';
import { ErrorState, Loading } from '../../src/components/StateViews';
import { useAuth } from '../../src/context/AuthContext';
import useApi from '../../src/hooks/useApi';
import { colors, spacing } from '../../src/theme';
import { formatDay } from '../../src/utils/format';

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { data: driver, loading, error, reload } = useApi(() => driversApi.get(id), [id]);
  const [verifying, setVerifying] = useState(false);

  if (loading && !driver) return <Loading />;
  if (error && !driver) return <ErrorState message={error} onRetry={reload} />;

  const verify = async () => {
    setVerifying(true);
    try {
      await driversApi.verify(driver.id);
      await reload();
    } catch (err) {
      Alert.alert('Could not verify', getErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Screen scroll>
      <Card>
        <View style={styles.header}>
          <Avatar name={driver.name} size={60} />
          <View style={styles.info}>
            <Text style={styles.name}>{driver.name}</Text>
            <Text style={styles.sub}>
              {driver.vehicleType.toLowerCase()}
              {driver.vehicleNumber ? ` · ${driver.vehicleNumber}` : ''}
            </Text>
            <Text style={styles.phone}>{driver.phone}</Text>
          </View>
        </View>
        <StarRating value={driver.avgRating} count={driver.ratingCount} size={18} />
        <Text style={styles.sub}>{driver.totalRides} rides completed via RidePool</Text>
        {!driver.isVerified && <Badge label="Pending verification" tone="warning" />}
        <Button title={`Call ${driver.name}`} icon="call" variant="success" onPress={() => callNumber(driver.phone)} />
        {user.role === 'ADMIN' && !driver.isVerified && (
          <Button title="Verify driver" loading={verifying} onPress={verify} />
        )}
      </Card>

      <Text style={styles.section}>Reviews</Text>
      {driver.ratings.length === 0 ? (
        <Text style={styles.sub}>No reviews yet. Riders can rate a driver after completing a ride.</Text>
      ) : (
        driver.ratings.map((rating) => (
          <Card key={rating.id}>
            <StarRating value={rating.rating} />
            {rating.review ? <Text style={styles.review}>{rating.review}</Text> : null}
            <Text style={styles.sub}>
              {rating.userName} · {formatDay(rating.createdAt)}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.muted, textTransform: 'none' },
  phone: { fontSize: 15, fontWeight: '600', color: colors.text },
  section: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.sm },
  review: { fontSize: 15, color: colors.text },
});
