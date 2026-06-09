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
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: Form) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Login failed', 'Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>AVYUKTHA</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue shopping</Text>

          <Controller control={control} name="email" render={({ field }) => (
            <Field label="Email" autoCapitalize="none" keyboardType="email-address"
              value={field.value} onChangeText={field.onChange} error={errors.email?.message} />
          )} />
          <Controller control={control} name="password" render={({ field }) => (
            <Field label="Password" secureTextEntry value={field.value}
              onChangeText={field.onChange} error={errors.password?.message} />
          )} />

          <Pressable style={[styles.cta, loading && { opacity: 0.6 }]} disabled={loading} onPress={handleSubmit(onSubmit)}>
            <Text style={styles.ctaText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.muted}>New here? </Text>
            <Link href="/(auth)/register" style={styles.link}>Create an account</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 24, paddingTop: 40 },
  logo: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, letterSpacing: 3, marginBottom: 32 },
  title: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.text },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginBottom: 28, marginTop: 4 },
  cta: { backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  ctaText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 15 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  muted: { fontFamily: fonts.body, color: colors.muted },
  link: { fontFamily: fonts.bodySemibold, color: colors.primary },
});
