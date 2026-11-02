import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

/** Read-only when `onChange` is omitted. */
export default function StarRating({ value, onChange, size = 16, count }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = (
          <Ionicons name={star <= Math.round(value) ? 'star' : 'star-outline'} size={size} color={colors.star} />
        );
        return onChange ? (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={6}>
            {icon}
          </Pressable>
        ) : (
          <View key={star}>{icon}</View>
        );
      })}
      {count !== undefined && (
        <Text style={styles.count}>{count > 0 ? `${value.toFixed(1)} (${count})` : 'No ratings yet'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  count: { marginLeft: 6, fontSize: 13, color: colors.muted },
});
