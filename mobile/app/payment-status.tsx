import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useVerifyPayment } from '../src/api/orders';
import { colors, fonts, radii, spacing } from '../src/theme';

type Phase = 'paying' | 'verifying' | 'failed';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function PaymentStatus() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId: string; provider: string; url: string }>();
  const orderId = String(params.orderId);
  const provider = (params.provider === 'stripe' ? 'stripe' : 'razorpay') as 'razorpay' | 'stripe';
  const url = decodeURIComponent(String(params.url || ''));

  const verify = useVerifyPayment();
  const [phase, setPhase] = useState<Phase>('paying');
  const started = useRef(false);

  const run = useCallback(async () => {
    setPhase('paying');
    if (url) await WebBrowser.openBrowserAsync(url);

    // Verify with a few quick retries (server also polls the gateway).
    setPhase('verifying');
    for (let i = 0; i < 3; i++) {
      try {
        await verify.mutateAsync({ orderId, provider });
        router.replace(`/order-success?id=${orderId}`);
        return;
      } catch {
        await sleep(1500);
      }
    }
    setPhase('failed');
  }, [orderId, provider, url]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
  }, [run]);

  // Block hardware back while paying/verifying.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => phase !== 'failed');
    return () => sub.remove();
  }, [phase]);

  const blocking = phase === 'paying' || phase === 'verifying';

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

      {blocking ? (
        <Animated.View entering={FadeIn} style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.title}>{phase === 'paying' ? 'Opening secure payment…' : 'Payment verification pending'}</Text>
          <Text style={styles.sub}>
            {phase === 'paying'
              ? 'Complete your payment in the window. Return here once done.'
              : 'Please wait while we confirm your payment. Do not close the app.'}
          </Text>
          {/* full-screen blocker — nothing else is tappable */}
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={styles.center}>
          <View style={styles.failIcon}><Ionicons name="close" size={48} color={colors.white} /></View>
          <Text style={styles.title}>Payment Not Confirmed</Text>
          <Text style={styles.sub}>
            We couldn't confirm your payment. If money was deducted it will auto-reflect shortly — or try paying again.
          </Text>

          <Pressable style={styles.retryBtn} onPress={run}>
            <Ionicons name="refresh" size={18} color={colors.white} />
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
          <Pressable style={styles.linkBtn} onPress={() => router.replace(`/order/${orderId}`)}>
            <Text style={styles.linkText}>View Order Status</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, justifyContent: 'center' },
  center: { alignItems: 'center' },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginTop: spacing.xl },
  sub: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 10, lineHeight: 21, paddingHorizontal: spacing.md },
  failIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  retryBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 16, marginTop: spacing.xxl },
  retryText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.white },
  linkBtn: { paddingVertical: 16 },
  linkText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.primary },
});
