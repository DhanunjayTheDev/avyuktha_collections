import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Screen from '../../src/components/Screen';
import Field from '../../src/components/Field';
import { useAuth } from '../../src/store/auth';
import { colors, fonts, radii } from '../../src/theme';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone').max(15),
  password: z.string().min(8, 'Min 8 characters'),
});
type Form = z.infer<typeof schema>;

export default function Register() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  const onSubmit = async (values: Form) => {
    setLoading(true);
    try {
      await register(values);
      Alert.alert('Account created', 'Check your email for the verification code, then sign in.');
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('Registration failed', 'That email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join Avyuktha Fashions</Text>

          <Controller control={control} name="name" render={({ field }) => (
            <Field label="Full name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
          )} />
          <Controller control={control} name="email" render={({ field }) => (
            <Field label="Email" autoCapitalize="none" keyboardType="email-address" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />
          )} />
          <Controller control={control} name="phone" render={({ field }) => (
            <Field label="Phone" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />
          )} />
          <Controller control={control} name="password" render={({ field }) => (
            <Field label="Password" secureTextEntry value={field.value} onChangeText={field.onChange} error={errors.password?.message} />
          )} />

          <Pressable style={[styles.cta, loading && { opacity: 0.6 }]} disabled={loading} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.ctaText}>{loading ? 'Creating…' : 'Create Account'}</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.muted}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.link}>Sign in</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, paddingTop: 40 },
  title: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.text },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginBottom: 28, marginTop: 4 },
  cta: { backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  ctaText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  muted: { fontFamily: fonts.body, color: colors.muted },
  link: { fontFamily: fonts.bodySemibold, color: colors.primary },
});
