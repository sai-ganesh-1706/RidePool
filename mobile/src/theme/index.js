import { createContext, useContext, useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';

/**
 * Yellow brand theme with automatic light / dark mode (follows the phone's system setting).
 *
 * Token notes:
 *  - `primary`      yellow used for fills (buttons, selected chips, FAB)
 *  - `onPrimary`    dark ink to put ON yellow (white on yellow is unreadable)
 *  - `primaryText`  amber used for text/icons on neutral or soft backgrounds (yellow on white is unreadable)
 */
const light = {
  primary: '#F5B301',
  primaryDark: '#D99A00',
  primarySoft: '#FFF4CC',
  primaryText: '#8A5A00',
  onPrimary: '#1F1500',
  bg: '#FAF8F2',
  card: '#FFFFFF',
  text: '#1C1A14',
  textSoft: '#403B2E',
  muted: '#6F6A5A',
  faint: '#A39E8C',
  border: '#EDE8D8',
  success: '#15803D',
  successSolid: '#15803D',
  successSoft: '#E7F6EC',
  warning: '#B45309',
  warningSoft: '#FEF3E2',
  danger: '#DC2626',
  dangerSoft: '#FDECEC',
  star: '#F59E0B',
  toastBg: '#1C1A14',
  toastText: '#FFFFFF',
  backdrop: 'rgba(28,26,20,0.45)',
};

const dark = {
  primary: '#FACC15',
  primaryDark: '#EAB308',
  primarySoft: '#33290A',
  primaryText: '#FACC15',
  onPrimary: '#1A1300',
  bg: '#0F0E0A',
  card: '#1B1A14',
  text: '#F5F3EA',
  textSoft: '#D6D2C2',
  muted: '#A29D8A',
  faint: '#6F6B5C',
  border: '#2E2C22',
  success: '#4ADE80',
  successSolid: '#16A34A',
  successSoft: '#12301D',
  warning: '#FBBF24',
  warningSoft: '#352708',
  danger: '#F87171',
  dangerSoft: '#3A1A1A',
  star: '#FBBF24',
  toastBg: '#F5F3EA',
  toastText: '#1C1A14',
  backdrop: 'rgba(0,0,0,0.6)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

/** Soft card shadow – cleaner than a hard border on every card. */
export const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 2 },
  default: {},
});

export const shadowStrong = Platform.select({
  ios: { shadowColor: '#F5B301', shadowOpacity: 0.4, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 6 },
  default: {},
});

const ThemeContext = createContext({ colors: light, scheme: 'light', isDark: false });

export function ThemeProvider({ children }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const value = useMemo(() => ({ colors: scheme === 'dark' ? dark : light, scheme, isDark: scheme === 'dark' }), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** `create` must be a module-level function `(colors) => StyleSheet.create({...})`. */
export function useThemedStyles(create) {
  const { colors } = useContext(ThemeContext);
  return useMemo(() => ({ colors, styles: create(colors) }), [colors, create]);
}

export const makeStackScreenOptions = (colors) => ({
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700', fontSize: 17, color: colors.text },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.bg },
});

export const makeTabScreenOptions = (colors) => ({
  headerStyle: { backgroundColor: colors.card },
  headerTitleStyle: { fontWeight: '700', fontSize: 17, color: colors.text },
  headerShadowVisible: false,
  tabBarActiveTintColor: colors.primaryText,
  tabBarInactiveTintColor: colors.faint,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1 },
  sceneStyle: { backgroundColor: colors.bg },
});
