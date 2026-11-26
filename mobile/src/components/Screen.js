import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, useThemedStyles } from '../theme';
import KeyboardSafeView from './KeyboardSafeView';

const FieldFocusContext = createContext(null);

/** TextField uses this to ask the surrounding Screen to scroll it into view. */
export const useFieldFocus = () => useContext(FieldFocusContext);

/**
 * Page container.
 *  - `scroll`  scrollable content that keeps the focused input visible above the keyboard
 *  - `safe`    adds the status-bar inset on top (for header-less screens such as login)
 *  - `tab`     the screen sits above a tab bar, so no bottom navigation-bar padding is added
 */
export default function Screen({
  children,
  scroll = false,
  safe = false,
  tab = false,
  padded = true,
  style,
  contentContainerStyle,
  ...rest
}) {
  const { styles } = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const focusedRef = useRef(null);

  const reveal = useCallback(() => {
    const node = focusedRef.current;
    const inner = scrollRef.current?.getInnerViewRef?.();
    if (!node || !inner) return;
    node.measureLayout(
      inner,
      (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(y - 110, 0), animated: true }),
      () => {},
    );
  }, []);

  const fieldFocus = useMemo(
    () => ({
      focus: (node) => {
        focusedRef.current = node;
        setTimeout(reveal, 120);
      },
    }),
    [reveal],
  );

  const onKeyboardChange = useCallback(
    ({ visible }) => {
      if (visible) setTimeout(reveal, 80);
      else focusedRef.current = null;
    },
    [reveal],
  );

  const contentStyle = [padded && styles.padded, style, contentContainerStyle];

  return (
    <KeyboardSafeView
      style={[styles.root, safe && { paddingTop: insets.top }]}
      bottomInset={!tab}
      onKeyboardChange={onKeyboardChange}
    >
      {scroll ? (
        <FieldFocusContext.Provider value={fieldFocus}>
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={contentStyle}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            {...rest}
          >
            {children}
          </ScrollView>
        </FieldFocusContext.Provider>
      ) : (
        <View style={[styles.flex, ...contentStyle]}>{children}</View>
      )}
    </KeyboardSafeView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  root: { backgroundColor: colors.bg },
  flex: { flex: 1 },
  padded: { padding: spacing.lg, gap: spacing.md },
});
