import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts, radii } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export default function Field({ label, error, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, !!error && styles.inputError]}
        {...props}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
    paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.body,
    fontSize: 15, color: colors.text, backgroundColor: colors.white,
  },
  inputError: { borderColor: colors.danger },
  error: { fontFamily: fonts.body, fontSize: 11, color: colors.danger, marginTop: 4 },
});
