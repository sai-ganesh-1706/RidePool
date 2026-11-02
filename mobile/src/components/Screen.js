import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

/** Page container. `scroll` makes it scrollable, `safe` adds safe-area padding (for header-less screens). */
export default function Screen({ children, scroll = false, safe = false, padded = true, style, ...rest }) {
  const Wrapper = safe ? SafeAreaView : View;
  const contentStyle = [padded && styles.padded, style];

  return (
    <Wrapper style={styles.flex}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, ...contentStyle]}>{children}</View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  padded: { padding: spacing.lg, gap: spacing.md },
});
