import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useThemedStyles } from '../../theme';
import { formatRupees, splitFare } from '../../utils/format';
import Button from '../Button';
import SheetModal from '../SheetModal';
import TextField from '../TextField';

const QUICK_FARES = [60, 80, 100, 150, 200];

/**
 * Organiser enters what they paid the driver; everyone sees the exact split before confirming.
 * Also used to correct the fare after completion (`initialFare` + `editing`).
 */
export default function FareModal({ visible, riderCount, loading, editing = false, initialFare, onClose, onSubmit }) {
  const { styles } = useThemedStyles(createStyles);
  const [fare, setFare] = useState('');

  useEffect(() => {
    if (visible) setFare(initialFare ? String(initialFare) : '');
  }, [visible, initialFare]);

  const total = parseInt(fare, 10);
  const valid = Number.isInteger(total) && total >= riderCount;
  const others = riderCount - 1;
  const { riderShare, creatorShare } = valid ? splitFare(total, riderCount) : {};

  return (
    <SheetModal visible={visible} title={editing ? 'Edit fare' : 'Complete ride'} onClose={onClose} scroll>
      <Text style={styles.help}>
        {editing
          ? 'Fix the total you paid the driver. Shares are recalculated.'
          : 'Enter the total you paid the driver. It is split equally between all riders.'}
      </Text>

      <TextField
        label="Total fare paid to the driver (₹)"
        value={fare}
        onChangeText={(text) => setFare(text.replace(/[^0-9]/g, '').slice(0, 5))}
        keyboardType="number-pad"
        placeholder="e.g. 120"
        autoFocus
      />

      <View style={styles.quick}>
        {QUICK_FARES.map((amount) => (
          <Pressable key={amount} onPress={() => setFare(String(amount))} style={[styles.quickChip, total === amount && styles.quickChipOn]}>
            <Text style={[styles.quickText, total === amount && styles.quickTextOn]}>{formatRupees(amount)}</Text>
          </Pressable>
        ))}
      </View>

      {valid ? (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {others} other rider{others === 1 ? '' : 's'} pay
            </Text>
            <Text style={styles.summaryValue}>{formatRupees(riderShare)} each</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Your share (you paid the driver)</Text>
            <Text style={styles.summaryValue}>{formatRupees(creatorShare)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>You collect</Text>
            <Text style={styles.totalValue}>{formatRupees(riderShare * others)}</Text>
          </View>
        </View>
      ) : fare ? (
        <Text style={styles.warn}>Enter at least {formatRupees(riderCount)} (₹1 per rider).</Text>
      ) : null}

      <Button
        title={editing ? 'Save new fare' : 'Complete & split fare'}
        loading={loading}
        disabled={!valid}
        onPress={() => onSubmit(total)}
      />
    </SheetModal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  help: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.bg },
  quickChipOn: { backgroundColor: colors.primarySoft },
  quickText: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  quickTextOn: { color: colors.primaryText },
  summary: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  summaryLabel: { flex: 1, fontSize: 14, color: colors.muted },
  summaryValue: { fontSize: 15, fontWeight: '700', color: colors.text },
  summaryTotal: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.success },
  warn: { fontSize: 13, color: colors.warning },
});
