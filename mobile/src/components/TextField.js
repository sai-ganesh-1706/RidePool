import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing, useThemedStyles } from '../theme';
import { useFieldFocus } from './Screen';

/** Text input with label, focus ring, inline error and a show/hide toggle for passwords. */
export default function TextField({ label, error, hint, style, multiline, secureTextEntry, onFocus, onBlur, ...inputProps }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const wrapperRef = useRef(null);
  const fieldFocus = useFieldFocus();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View ref={wrapperRef} style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, focused && styles.boxFocused, Boolean(error) && styles.boxError]}>
        <TextInput
          placeholderTextColor={colors.faint}
          multiline={multiline}
          secureTextEntry={isPassword && hidden}
          selectionColor={colors.primary}
          style={[styles.input, multiline && styles.multiline, style]}
          onFocus={(event) => {
            setFocused(true);
            fieldFocus?.focus(wrapperRef.current);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {isPassword && (
          <Pressable onPress={() => setHidden((value) => !value)} hitSlop={12} style={styles.eye}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSoft },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  boxFocused: { borderColor: colors.primary },
  boxError: { borderColor: colors.danger },
  input: { flex: 1, paddingVertical: 13, fontSize: 16, color: colors.text },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  eye: { paddingLeft: spacing.sm },
  error: { fontSize: 12, color: colors.danger },
  hint: { fontSize: 12, color: colors.muted },
});
