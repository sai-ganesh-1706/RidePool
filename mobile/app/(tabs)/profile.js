import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import Avatar from '../../src/components/Avatar';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import Screen from '../../src/components/Screen';
import TextField from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme';

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    hostelBlock: user.hostelBlock ?? '',
    roomNumber: user.roomNumber ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Could not save', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () =>
    Alert.alert('Log out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);

  return (
    <Screen scroll>
      <Avatar name={user.name} size={72} />
      <Text style={styles.email}>{user.email}</Text>
      {user.role === 'ADMIN' && <Badge label="Admin" tone="primary" />}

      <TextField label="Name" value={form.name} onChangeText={set('name')} />
      <TextField label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
      <TextField label="Hostel block" value={form.hostelBlock} onChangeText={set('hostelBlock')} />
      <TextField label="Room number" value={form.roomNumber} onChangeText={set('roomNumber')} />

      <Button title="Save changes" loading={saving} onPress={save} />
      <Button title="Log out" variant="danger" onPress={confirmLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  email: { fontSize: 15, color: colors.muted, marginBottom: spacing.xs },
});
