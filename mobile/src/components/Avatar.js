import { StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../theme';
import { initialOf } from '../utils/format';

export default function Avatar({ name, size = 40 }) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initialOf(name)}</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  circle: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  initial: { color: colors.primaryText, fontWeight: '700' },
});
