import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardOverlap from '../hooks/useKeyboardOverlap';
import { radius, spacing, useThemedStyles } from '../theme';

function Sheet({ title, onClose, scroll, children }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const overlayRef = useRef(null);
  const insets = useSafeAreaInsets();
  const { visible, overlap } = useKeyboardOverlap(overlayRef);

  const body = (
    <>
      <View style={styles.handle} />
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
          <Ionicons name="close" size={20} color={colors.muted} />
        </Pressable>
      </View>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </>
  );

  return (
    <View ref={overlayRef} style={[styles.overlay, { paddingBottom: visible ? overlap : 0 }]}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      {/* The sheet's own background runs under the system bar; its content stays above it. */}
      <View style={[styles.sheet, { paddingBottom: spacing.lg + (visible ? 0 : insets.bottom) }]}>{body}</View>
    </View>
  );
}

/** Bottom sheet used for short forms and pickers. Keyboard- and navigation-bar-safe. */
export default function SheetModal({ visible, title, onClose, scroll = false, children }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {/* A Modal is its own window on Android, so it needs its own safe-area context. */}
      <SafeAreaProvider>
        <Sheet title={title} onClose={onClose} scroll={scroll}>
          {children}
        </Sheet>
      </SafeAreaProvider>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.backdrop },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '85%',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: 19, fontWeight: '800', color: colors.text, flex: 1 },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  content: { gap: spacing.md },
});
