import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { initialOf } from '../utils/format';

export default function Avatar({ name, size = 40 }) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initialOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.primary, fontWeight: '700' },
});
