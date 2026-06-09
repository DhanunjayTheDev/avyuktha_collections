import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii } from '../theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCta?: () => void;
}

export default function EmptyState({ icon, title, subtitle, ctaText, onCta }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}><Ionicons name={icon} size={30} color={colors.muted} /></View>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {!!ctaText && (
        <Pressable style={styles.cta} onPress={onCta}>
          <Text style={styles.ctaText}>{ctaText}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text, textAlign: 'center' },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 6, maxWidth: 260 },
  cta: { marginTop: 20, backgroundColor: colors.text, borderRadius: radii.full, paddingHorizontal: 24, paddingVertical: 13 },
  ctaText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 14 },
});
