import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { formatTime } from '../utils/format';
import Chip from './Chip';

const isSameDay = (a, b) => a.toDateString() === b.toDateString();

/** Departure picker: Today / Tomorrow chips + a time selector. */
export default function DateTimeField({ label, value, onChange }) {
  const setDayOffset = (offset) => {
    const next = new Date();
    next.setDate(next.getDate() + offset);
    next.setHours(value.getHours(), value.getMinutes(), 0, 0);
    onChange(next);
  };

  const applyTime = (picked) => {
    const next = new Date(value);
    next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    onChange(next);
  };

  const openAndroidPicker = () =>
    DateTimePickerAndroid.open({
      value,
      mode: 'time',
      onChange: (event, picked) => event.type === 'set' && picked && applyTime(picked),
    });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <Chip label="Today" selected={isSameDay(value, new Date())} onPress={() => setDayOffset(0)} />
        <Chip label="Tomorrow" selected={isSameDay(value, tomorrow)} onPress={() => setDayOffset(1)} />
        {Platform.OS === 'ios' ? (
          <DateTimePicker value={value} mode="time" display="compact" onChange={(_, picked) => picked && applyTime(picked)} />
        ) : (
          <Pressable style={styles.timeButton} onPress={openAndroidPicker}>
            <Text style={styles.timeText}>{formatTime(value)}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  timeText: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
