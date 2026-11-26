import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../src/api/client';
import Avatar from '../../src/components/Avatar';
import Badge from '../../src/components/Badge';
import Button from '../../src/components/Button';
import Card from '../../src/components/Card';
import Screen from '../../src/components/Screen';
import { useToast } from '../../src/components/Toast';
import TextField from '../../src/components/TextField';
import { useAuth } from '../../src/context/AuthContext';
import { spacing, useThemedStyles } from '../../src/theme';

export default function ProfileScreen() {
  const { styles } = useThemedStyles(createStyles);
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    hostelBlock: user.hostelBlock ?? '',
    roomNumber: user.roomNumber ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));
  const changed =
    form.name !== user.name ||
    form.phone !== user.phone ||
    form.hostelBlock !== (user.hostelBlock ?? '') ||
    form.roomNumber !== (user.roomNumber ?? '');

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast('Profile updated');
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
    <Screen scroll tab>
      <View style={styles.header}>
        <Avatar name={user.name} size={76} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.role === 'ADMIN' && <Badge label="Admin" tone="primary" />}
      </View>

      <Card style={styles.form}>
        <TextField label="Name" value={form.name} onChangeText={set('name')} autoCapitalize="words" />
        <TextField label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
        <View style={styles.pair}>
          <View style={styles.half}>
            <TextField label="Hostel block" value={form.hostelBlock} onChangeText={set('hostelBlock')} />
          </View>
          <View style={styles.half}>
            <TextField label="Room no." value={form.roomNumber} onChangeText={set('roomNumber')} />
          </View>
        </View>
        <Button title="Save changes" loading={saving} disabled={!changed || !form.name.trim() || !form.phone.trim()} onPress={save} />
      </Card>

      <Button title="Log out" variant="danger" onPress={confirmLogout} />
    </Screen>
  );
}

const createStyles = (colors) => StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  email: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs },
  form: { gap: spacing.lg },
  pair: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});
