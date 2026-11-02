import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../theme';
import Button from '../Button';
import SheetModal from '../SheetModal';
import StarRating from '../StarRating';
import TextField from '../TextField';

export default function RateDriverModal({ visible, driverName, loading, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  return (
    <SheetModal visible={visible} title={`Rate ${driverName}`} onClose={onClose}>
      <StarRating value={rating} onChange={setRating} size={36} />
      <Text style={styles.hint}>{rating} / 5</Text>
      <TextField label="Review (optional)" value={review} onChangeText={setReview} multiline maxLength={300} />
      <Button title="Submit rating" loading={loading} onPress={() => onSubmit({ rating, review })} />
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 14, color: colors.muted },
});
