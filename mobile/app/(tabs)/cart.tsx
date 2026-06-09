import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import EmptyState from '../../src/components/EmptyState';
import { useAuth } from '../../src/store/auth';
import { useCart, useCartMutations, cartTotals } from '../../src/api/cart';
import { colors, fonts, radii, spacing } from '../../src/theme';
import { formatPrice } from '../../src/utils/format';
import type { CartItem, ProductVariant } from '../../src/types';

const variantLabel = (item: CartItem) => {
  const v = item.product.variants?.find((x) => x.sku === item.variantSku);
  const attrs = v?.attributes ? Object.values(v.attributes).filter(Boolean) : [];
  return attrs.length ? attrs.join(' · ') : item.variantSku;
};

export default function Cart() {
  const router = useRouter();
  const isAuth = useAuth((s) => s.isAuthenticated);
  const { data: cart, isLoading } = useCart();
  const { update, remove } = useCartMutations();
  const { count, subtotal } = cartTotals(cart);
  const shipping = subtotal > 0 && subtotal < 999 ? 99 : 0;
  const total = subtotal + shipping;

  if (!isAuth) {
    return (
      <Screen>
        <Text style={styles.header}>Cart</Text>
        <EmptyState icon="bag-outline" title="Sign in to view your cart"
          ctaText="Sign In" onCta={() => router.push('/(auth)/login')} />
      </Screen>
    );
  }

  if (isLoading) {
    return <Screen><Text style={styles.header}>Cart</Text><ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /></Screen>;
  }

  if (!cart?.items?.length) {
    return (
      <Screen>
        <Text style={styles.header}>Cart</Text>
        <EmptyState icon="bag-outline" title="Your cart is empty"
          subtitle="Add pieces you love and they’ll show up here."
          ctaText="Start shopping" onCta={() => router.push('/(tabs)')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.header}>Cart ({count})</Text>
      <FlatList
        data={cart.items}
        keyExtractor={(i) => `${i.product._id}-${i.variantSku}`}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 16 }}
        renderItem={({ item }: { item: CartItem }) => {
          const v = item.product.variants?.find((x: ProductVariant) => x.sku === item.variantSku);
          const maxStock = v?.stock ?? 99;
          return (
            <View style={styles.row}>
              <Image source={{ uri: item.product.images?.[0] }} style={styles.thumb} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.variant}>{variantLabel(item)}</Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                <View style={styles.qtyRow}>
                  <Pressable style={styles.qtyBtn} onPress={() => {
                    if (item.quantity <= 1) remove.mutate({ productId: item.product._id, variantSku: item.variantSku });
                    else update.mutate({ productId: item.product._id, variantSku: item.variantSku, quantity: item.quantity - 1 });
                  }}>
                    <Ionicons name={item.quantity <= 1 ? 'trash-outline' : 'remove'} size={15} color={colors.text} />
                  </Pressable>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <Pressable style={styles.qtyBtn} disabled={item.quantity >= maxStock}
                    onPress={() => update.mutate({ productId: item.product._id, variantSku: item.variantSku, quantity: item.quantity + 1 })}>
                    <Ionicons name="add" size={15} color={item.quantity >= maxStock ? colors.muted : colors.text} />
                  </Pressable>
                </View>
              </View>
              <Pressable onPress={() => remove.mutate({ productId: item.product._id, variantSku: item.variantSku })}>
                <Ionicons name="close" size={18} color={colors.muted} />
              </Pressable>
            </View>
          );
        }}
      />

      {/* Summary + checkout */}
      <View style={styles.summary}>
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumVal}>{formatPrice(subtotal)}</Text></View>
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Shipping</Text><Text style={styles.sumVal}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</Text></View>
        <View style={[styles.sumRow, { marginTop: 6 }]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalVal}>{formatPrice(total)}</Text></View>
        <Pressable style={styles.checkout} onPress={() => router.push('/checkout')}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, padding: spacing.lg },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'flex-start' },
  thumb: { width: 70, height: 92, borderRadius: radii.md, backgroundColor: colors.surface },
  name: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  variant: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  price: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  qty: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, minWidth: 18, textAlign: 'center' },
  summary: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sumLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  sumVal: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  totalLabel: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  totalVal: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text },
  checkout: { backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 16, alignItems: 'center', marginTop: 14 },
  checkoutText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.white },
});
