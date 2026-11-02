import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import { locationsApi } from '../../src/api/locations';
import { ridesApi } from '../../src/api/rides';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import Chip from '../../src/components/Chip';
import DateTimeField from '../../src/components/DateTimeField';
import RideCard from '../../src/components/RideCard';
import Screen from '../../src/components/Screen';
import { ErrorState, Loading } from '../../src/components/StateViews';
import TextField from '../../src/components/TextField';
import useApi from '../../src/hooks/useApi';
import { colors, spacing } from '../../src/theme';
import { defaultDepartureTime } from '../../src/utils/format';

const RIDER_OPTIONS = [2, 3, 4];

function ChipGroup({ label, children }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

export default function CreateRideScreen() {
  const router = useRouter();
  const { data: locations, loading, error, reload } = useApi(() => locationsApi.list(), []);

  const [fromId, setFromId] = useState(null);
  const [toId, setToId] = useState(null);
  const [departure, setDeparture] = useState(() => defaultDepartureTime());
  const [maxRiders, setMaxRiders] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [similarRides, setSimilarRides] = useState([]);

  if (loading && !locations) return <Loading />;
  if (error && !locations) return <ErrorState message={error} onRetry={reload} />;

  const from = fromId ?? locations.find((location) => location.isCampus)?.id ?? null;

  const guarded = async (action) => {
    setSubmitting(true);
    try {
      await action();
    } catch (err) {
      Alert.alert('Something went wrong', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const createRide = () =>
    guarded(async () => {
      const ride = await ridesApi.create({
        fromLocationId: from,
        toLocationId: toId,
        departureTime: departure.toISOString(),
        maxRiders,
        notes,
      });
      router.replace(`/ride/${ride.id}`);
    });

  const joinExisting = (ride) =>
    guarded(async () => {
      await ridesApi.join(ride.id);
      router.replace(`/ride/${ride.id}`);
    });

  // Step 1: look for similar rides first (auto-match). Step 2: post if none / user insists.
  const submit = () => {
    if (!from || !toId) return Alert.alert('Missing details', 'Choose where you are going.');
    if (from === toId) return Alert.alert('Check your route', 'Pickup and destination must be different.');

    guarded(async () => {
      const matches = await ridesApi.suggestions({
        fromLocationId: from,
        toLocationId: toId,
        departureTime: departure.toISOString(),
      });
      setSimilarRides(matches);
      if (matches.length === 0) await createRide();
    });
  };

  const renderLocations = (selectedId, onSelect) =>
    locations.map((location) => (
      <Chip key={location.id} label={location.name} selected={selectedId === location.id} onPress={() => onSelect(location.id)} />
    ));

  return (
    <Screen scroll>
      <ChipGroup label="Pickup">{renderLocations(from, (id) => { setFromId(id); setSimilarRides([]); })}</ChipGroup>
      <ChipGroup label="Destination">{renderLocations(toId, (id) => { setToId(id); setSimilarRides([]); })}</ChipGroup>

      <DateTimeField
        label="Departure"
        value={departure}
        onChange={(next) => {
          setDeparture(next);
          setSimilarRides([]);
        }}
      />

      <ChipGroup label="Max riders (including you)">
        {RIDER_OPTIONS.map((count) => (
          <Chip key={count} label={String(count)} selected={maxRiders === count} onPress={() => setMaxRiders(count)} />
        ))}
      </ChipGroup>

      <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="e.g. Meet at the main gate" maxLength={200} />

      {similarRides.length > 0 ? (
        <Card style={styles.suggestions}>
          <Text style={styles.suggestionTitle}>Others are going the same way</Text>
          <Text style={styles.suggestionHint}>Join one of these instead and share the fare:</Text>
          {similarRides.map((ride) => (
            <View key={ride.id} style={styles.suggestion}>
              <RideCard ride={ride} />
              <Button title="Join this ride" disabled={submitting} onPress={() => joinExisting(ride)} />
            </View>
          ))}
          <Button title="Post my own ride anyway" variant="secondary" loading={submitting} onPress={createRide} />
        </Card>
      ) : (
        <Button title="Find or post ride" loading={submitting} onPress={submit} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  suggestions: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, gap: spacing.md },
  suggestionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  suggestionHint: { fontSize: 14, color: colors.muted },
  suggestion: { gap: spacing.sm },
});
