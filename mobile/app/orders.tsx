import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Screen from '../src/components/Screen';
import EmptyState from '../src/components/EmptyState';
import { useAuth } from '../src/store/auth';
import { useMyOrders } from '../src/api/orders';
import { colors, fonts, radii, spacing } from '../src/theme';
import { formatPrice } from '../src/utils/format';
import { statusColor } from '../src/utils/status';

export default function Orders() {
  const router = useRouter();
  const isAuth = useAuth((s) => s.isAuthenticated);
  const { data, isLoading } = useMyOrders();
  const orders = data?.data ?? [];

  return (
    <Screen edges={false}>
      <Stack.Screen options={{ headerShown: true, title: 'My Orders', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />
      {!isAuth ? (
        <EmptyState icon="cube-outline" title="Sign in to view orders" ctaText="Sign In" onCta={() => router.push('/(auth)/login')} />
      ) : isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : orders.length === 0 ? (
        <EmptyState icon="cube-outline" title="No orders yet" subtitle="Your orders will appear here." ctaText="Start shopping" onCta={() => router.push('/(tabs)')} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          contentContainerStyle={{ padding: spacing.lg, gap: 12 }}
          renderItem={({ item }) => {
            const c = statusColor(item.status);
            return (
              <Pressable style={styles.card} onPress={() => router.push(`/order/${item._id}`)}>
                <View style={styles.cardTop}>
                  <Text style={styles.orderId}>#{item.orderId}</Text>
                  <View style={[styles.badge, { backgroundColor: c.bg }]}><Text style={[styles.badgeText, { color: c.text }]}>{item.status}</Text></View>
                </View>
                <Text style={styles.meta}>{new Date(item.createdAt).toLocaleDateString('en-IN')} · {item.items.length} item(s)</Text>
                <Text style={styles.total}>{formatPrice(item.total)}</Text>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: 14, backgroundColor: colors.white },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 10, textTransform: 'capitalize' },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 6 },
  total: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, marginTop: 4 },
});
