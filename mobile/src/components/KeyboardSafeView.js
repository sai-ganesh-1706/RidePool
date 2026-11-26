import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardOverlap from '../hooks/useKeyboardOverlap';

/**
 * Lifts its content above the keyboard and, when the keyboard is closed, above the system
 * navigation bar (back / home buttons). Set `bottomInset={false}` on screens that already sit
 * above a tab bar.
 */
export default function KeyboardSafeView({ children, style, bottomInset = true, onKeyboardChange }) {
  const ref = useRef(null);
  const insets = useSafeAreaInsets();
  const { visible, overlap } = useKeyboardOverlap(ref);

  useEffect(() => {
    onKeyboardChange?.({ visible, overlap });
  }, [visible, overlap, onKeyboardChange]);

  const paddingBottom = visible ? overlap : bottomInset ? insets.bottom : 0;

  return (
    <View ref={ref} style={[styles.flex, style, { paddingBottom }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
