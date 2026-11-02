import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import { driversApi } from '../../src/api/drivers';
import Button from '../../src/components/Button';
import Chip from '../../src/components/Chip';
import Screen from '../../src/components/Screen';
import TextField from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme';

const VEHICLE_TYPES = ['AUTO', 'CAB', 'TEMPO'];

export default function AddDriverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', vehicleNumber: '', vehicleType: 'AUTO' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    setLoading(true);
    try {
      const driver = await driversApi.create(form);
      const message = driver.isVerified
        ? 'The driver is now in the directory.'
        : 'The driver will appear for everyone once an admin verifies them.';
      Alert.alert('Driver added', message, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert('Could not add driver', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      {user.role !== 'ADMIN' && (
        <Text style={styles.note}>New drivers are reviewed by an admin before others can see them.</Text>
      )}
      <TextField label="Driver name" value={form.name} onChangeText={set('name')} />
      <TextField label="Phone number" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <TextField label="Vehicle number (optional)" value={form.vehicleNumber} onChangeText={set('vehicleNumber')} autoCapitalize="characters" />
      <View style={styles.types}>
        {VEHICLE_TYPES.map((type) => (
          <Chip key={type} label={type.charAt(0) + type.slice(1).toLowerCase()} selected={form.vehicleType === type} onPress={() => set('vehicleType')(type)} />
        ))}
      </View>
      <Button title="Add driver" loading={loading} disabled={!form.name || !form.phone} onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 14, color: colors.muted },
  types: { flexDirection: 'row', gap: spacing.sm },
});
