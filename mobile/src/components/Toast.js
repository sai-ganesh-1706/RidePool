import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, shadow, spacing, useTheme, useThemedStyles } from '../theme';

const ToastContext = createContext(() => {});

/** Lightweight, non-blocking feedback ("Joined ride") – replaces success pop-up dialogs. */
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const { styles } = useThemedStyles(createStyles);
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const show = useCallback(
    (message, tone = 'success') => {
      clearTimeout(timer.current);
      setToast({ message, tone });
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setToast(null));
      }, 2200);
    },
    [opacity],
  );

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View pointerEvents="none" style={[styles.toast, { top: insets.top + spacing.sm, opacity }]}>
          <Ionicons
            name={toast.tone === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={20}
            color={toast.tone === 'success' ? (isDark ? '#15803D' : '#4ADE80') : isDark ? '#DC2626' : '#FCA5A5'}
          />
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const createStyles = (colors) => StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.toastBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    ...shadow,
  },
  text: { flex: 1, color: colors.toastText, fontSize: 14, fontWeight: '600' },
});
