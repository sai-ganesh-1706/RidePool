import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { driversApi } from '../../api/drivers';
import useApi from '../../hooks/useApi';
import { colors, spacing } from '../../theme';
import Avatar from '../Avatar';
import SheetModal from '../SheetModal';
import StarRating from '../StarRating';
import { EmptyState, Loading } from '../StateViews';

function PickerList({ onPick }) {
  const { data, loading } = useApi(() => driversApi.list(), []);
  const drivers = (data ?? []).filter((driver) => driver.isVerified);

  if (loading) return <Loading />;
  if (drivers.length === 0) return <EmptyState title="No verified drivers yet" />;

  return (
    <FlatList
      data={drivers}
      keyExtractor={(driver) => driver.id}
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => onPick(item)}>
          <Avatar name={item.name} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <StarRating value={item.avgRating} count={item.ratingCount} size={13} />
          </View>
        </Pressable>
      )}
    />
  );
}

export default function DriverPickerModal({ visible, onClose, onPick }) {
  return (
    <SheetModal visible={visible} title="Choose a driver" onClose={onClose}>
      {visible && <PickerList onPick={onPick} />}
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
});
