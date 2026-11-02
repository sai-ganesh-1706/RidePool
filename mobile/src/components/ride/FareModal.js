import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../theme';
import { formatRupees } from '../../utils/format';
import Button from '../Button';
import SheetModal from '../SheetModal';
import TextField from '../TextField';

export default function FareModal({ visible, riderCount, loading, onClose, onSubmit }) {
  const [fare, setFare] = useState('');
  const total = parseInt(fare, 10);
  const valid = Number.isInteger(total) && total > 0;

  return (
    <SheetModal visible={visible} title="Complete ride" onClose={onClose}>
      <TextField
        label="Total fare paid to the driver (₹)"
        value={fare}
        onChangeText={(text) => setFare(text.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder="e.g. 120"
      />
      {valid && (
        <Text style={styles.split}>
          Split between {riderCount} riders: {formatRupees(Math.ceil(total / riderCount))} each
        </Text>
      )}
      <Button title="Complete & split fare" loading={loading} disabled={!valid} onPress={() => onSubmit(total)} />
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  split: { fontSize: 15, fontWeight: '600', color: colors.primary },
});
