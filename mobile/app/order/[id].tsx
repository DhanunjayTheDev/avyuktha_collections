import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import { useOrder, useCancelOrder } from '../../src/api/orders';
import type { OrderItem } from '../../src/types';
import { colors, fonts, radii, spacing } from '../../src/theme';
import { formatPrice } from '../../src/utils/format';
import { statusColor, ORDER_FLOW } from '../../src/utils/status';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading } = useOrder(id);
  const cancel = useCancelOrder();

  if (isLoading || !order) {
    return <View style={styles.center}><Stack.Screen options={{ title: 'Order' }} /><ActivityIndicator color={colors.primary} /></View>;
  }

  const c = statusColor(order.status);
  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const flowIndex = ORDER_FLOW.indexOf(order.status);

  const onCancel = () => {
    Alert.alert('Cancel order?', 'This cannot be undone.', [
      { text: 'No', style: 'cancel' },
      { text: 'Cancel Order', style: 'destructive', onPress: () => cancel.mutate({ id: order._id, reason: 'Customer request' }) },
    ]);
  };

  return (
    <Screen edges={false}>
      <Stack.Screen options={{ headerShown: true, title: `#${order.orderId}`, headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 32 }}>
        <View style={[styles.statusBox, { backgroundColor: c.bg }]}>
          <Text style={[styles.statusText, { color: c.text }]}>{order.status}</Text>
        </View>

        {/* Timeline (hidden for cancelled/returned) */}
        {order.status !== 'cancelled' && order.status !== 'returned' && (
          <View style={styles.timeline}>
            {ORDER_FLOW.map((s, i) => {
              const done = i <= flowIndex;
              return (
                <View key={s} style={styles.step}>
                  <View style={[styles.dot, done && styles.dotDone]}>
                    {done && <Ionicons name="checkmark" size={11} color={colors.white} />}
                  </View>
                  <Text style={[styles.stepLabel, done && { color: colors.text }]}>{s}</Text>
                </View>
              );
            })}
          </View>
        )}

        {order.trackingUrl && (
          <Pressable style={styles.track} onPress={() => Linking.openURL(order.trackingUrl!)}>
            <Ionicons name="navigate-outline" size={16} color={colors.white} />
            <Text style={styles.trackText}>Track Shipment{order.awbCode ? ` · ${order.awbCode}` : ''}</Text>
          </Pressable>
        )}

        {/* Items */}
        <Text style={styles.section}>Items</Text>
        {order.items.map((it: OrderItem, idx: number) => (
          <View key={idx} style={styles.item}>
            <Image source={{ uri: it.product.images?.[0] }} style={styles.thumb} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={2}>{it.product.name}</Text>
              {!!it.variant?.attributes && <Text style={styles.itemVar}>{Object.values(it.variant.attributes).join(' · ')}</Text>}
              <Text style={styles.itemMeta}>Qty {it.quantity} · {formatPrice(it.price)}</Text>
              {order.status === 'delivered' && (
                <Pressable onPress={() => router.push(`/review/${it.product._id}?orderId=${order._id}`)}>
                  <Text style={styles.reviewLink}>Write a review</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}

        {/* Address */}
        <Text style={styles.section}>Delivery Address</Text>
        <Text style={styles.addr}>{order.shippingAddress.fullName}{'\n'}{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}{'\n'}{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}{'\n'}{order.shippingAddress.phone}</Text>

        {/* Summary */}
        <Text style={styles.section}>Payment</Text>
        <Row label="Subtotal" value={formatPrice(order.subtotal)} />
        {order.discount > 0 && <Row label="Discount" value={`- ${formatPrice(order.discount)}`} />}
        <Row label="Shipping" value={order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge)} />
        <Row label="Total" value={formatPrice(order.total)} bold />
        <Text style={styles.payMeta}>{order.paymentMethod.toUpperCase()} · {order.paymentStatus}</Text>

        {canCancel && (
          <Pressable style={styles.cancelBtn} onPress={onCancel} disabled={cancel.isPending}>
            <Text style={styles.cancelText}>{cancel.isPending ? 'Cancelling…' : 'Cancel Order'}</Text>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowVal, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  statusBox: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.full },
  statusText: { fontFamily: fonts.bodySemibold, fontSize: 13, textTransform: 'capitalize' },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  step: { alignItems: 'center', flex: 1 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  dotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.muted, marginTop: 4, textTransform: 'capitalize' },
  track: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radii.full, paddingVertical: 13, marginTop: spacing.xl },
  trackText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 14 },
  section: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  item: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  thumb: { width: 56, height: 74, borderRadius: radii.sm, backgroundColor: colors.surface },
  itemName: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
  itemVar: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  itemMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  reviewLink: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.primary, marginTop: 6 },
  addr: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  rowLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  rowVal: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  bold: { fontFamily: fonts.bodySemibold, color: colors.text },
  payMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 6, textTransform: 'capitalize' },
  cancelBtn: { marginTop: spacing.xxl, borderWidth: 1, borderColor: colors.danger, borderRadius: radii.full, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.danger },
});
