import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import Field from '../../src/components/Field';
import { useAuth } from '../../src/store/auth';
import { colors, fonts, radii, spacing, shadow } from '../../src/theme';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your name'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(10, 'Enter a valid phone').max(15),
    password: z
      .string()
      .min(8, 'Min 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter required')
      .regex(/[0-9]/, 'One number required')
      .regex(/[^A-Za-z0-9]/, 'One special character required'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type Form = z.infer<typeof schema>;

const RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

export default function Register() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });
  const pwd = watch('password');

  const onSubmit = async (values: Form) => {
    setLoading(true);
    try {
      await register({ name: values.name, email: values.email, phone: values.phone, password: values.password });
      router.push({ pathname: '/(auth)/verify-otp', params: { email: values.email } });
    } catch {
      Alert.alert('Registration failed', 'That email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}>
          <View style={styles.hero}>
            <Text style={styles.brand}>AVYUKTHA</Text>
            <Text style={styles.brandSub}>FASHIONS</Text>
          </View>

          <View style={[styles.card, shadow.card]}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join Avyuktha Fashions</Text>

            <Controller control={control} name="name" render={({ field }) => (
              <Field label="Full name" required value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
            )} />
            <Controller control={control} name="email" render={({ field }) => (
              <Field label="Email" required autoCapitalize="none" keyboardType="email-address" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />
            )} />
            <Controller control={control} name="phone" render={({ field }) => (
              <Field label="Phone" required keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />
            )} />
            <Controller control={control} name="password" render={({ field }) => (
              <Field label="Password" required secureTextEntry value={field.value} onChangeText={field.onChange} error={errors.password?.message} />
            )} />

            {/* Live password rules checklist */}
            <View style={styles.rules}>
              {RULES.map((r) => {
                const ok = r.test(pwd || '');
                return (
                  <View key={r.label} style={styles.rule}>
                    <Ionicons
                      name={ok ? 'checkmark-circle' : 'ellipse-outline'}
                      size={15}
                      color={ok ? colors.success : colors.muted}
                    />
                    <Text style={[styles.ruleText, ok && styles.ruleOk]}>{r.label}</Text>
                  </View>
                );
              })}
            </View>

            <Controller control={control} name="confirmPassword" render={({ field }) => (
              <Field label="Confirm password" required secureTextEntry value={field.value} onChangeText={field.onChange} error={errors.confirmPassword?.message} />
            )} />

            <Pressable style={[styles.cta, loading && { opacity: 0.6 }]} disabled={loading} onPress={handleSubmit(onSubmit)}>
              <Text style={styles.ctaText}>{loading ? 'Creating…' : 'Create Account'}</Text>
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.muted}>Already have an account? </Text>
              <Link href="/(auth)/login" style={styles.link}>Sign in</Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 200, alignItems: 'center', justifyContent: 'center', paddingTop: 40, backgroundColor: colors.primary },
  brand: { fontFamily: fonts.headingBold, fontSize: 30, color: colors.white, letterSpacing: 5 },
  brandSub: { fontFamily: fonts.body, fontSize: 10, color: 'rgba(255,255,255,0.85)', letterSpacing: 8, marginTop: 4 },
  card: { marginTop: -32, marginHorizontal: spacing.lg, backgroundColor: colors.white, borderRadius: radii.xxl, padding: spacing.xl },
  title: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginBottom: 24, marginTop: 4 },
  rules: { marginTop: -4, marginBottom: 16, gap: 6 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  ruleOk: { color: colors.text },
  cta: { backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  ctaText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  muted: { fontFamily: fonts.body, color: colors.muted },
  link: { fontFamily: fonts.bodySemibold, color: colors.primary },
});
