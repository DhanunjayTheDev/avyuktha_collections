import { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, useWindowDimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProduct } from '../../src/api/catalog';
import { useProductReviews, type Review } from '../../src/api/content';
import { recentlyViewed } from '../../src/lib/recentlyViewed';
import { useCartMutations } from '../../src/api/cart';
import { useWishlist, useToggleWishlist } from '../../src/api/wishlist';
import { useAuth } from '../../src/store/auth';
import { colors, fonts, radii, spacing, shadow } from '../../src/theme';
import { formatPrice } from '../../src/utils/format';
import type { Product, ProductVariant } from '../../src/types';

export default function ProductDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data: product, isLoading } = useProduct(slug);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const isAuth = useAuth((s) => s.isAuthenticated);
  const { add } = useCartMutations();
  const { data: wishlist } = useWishlist();
  const toggle = useToggleWishlist();

  const { data: reviews } = useProductReviews(product?._id ?? '');

  const selected = variant ?? product?.variants?.[0] ?? null;
  const wishlisted = !!wishlist?.some((p: Product) => p._id === product?._id);

  // Track recently viewed once the product loads.
  useEffect(() => { if (product) void recentlyViewed.add(product); }, [product?._id]);

  const requireAuth = (fn: () => void) => {
    if (!isAuth) { router.push('/(auth)/login'); return; }
    fn();
  };

  const onAddToCart = () => requireAuth(() => {
    if (!selected) return;
    add.mutate(
      { productId: product!._id, variantSku: selected.sku, quantity: 1 },
      { onSuccess: () => Alert.alert('Added to bag', product!.name) }
    );
  });

  // unique values per variant attribute (e.g. size, color)
  const attrKeys = useMemo(
    () => Array.from(new Set((product?.variants ?? []).flatMap((v: ProductVariant) => Object.keys(v.attributes ?? {})))) as string[],
    [product]
  );

  if (isLoading || !product) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: '' }} />
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const stock = selected?.stock ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: true, title: '', headerBackTitle: 'Back', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View>
          <Image source={{ uri: selected?.images?.[0] ?? product.images?.[0] }} style={{ width, aspectRatio: 3 / 4, backgroundColor: colors.surface }} contentFit="cover" transition={200} />
          {product.discountPercentage > 0 && (
            <View style={styles.discBadge}><Text style={styles.discText}>-{product.discountPercentage}%</Text></View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.category}>{product.category?.name}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.salePrice)}</Text>
            {product.mrp > product.salePrice && <Text style={styles.mrp}>{formatPrice(product.mrp)}</Text>}
            {product.discountPercentage > 0 && <Text style={styles.off}>{product.discountPercentage}% off</Text>}
          </View>

          {/* Stock */}
          {stock <= 0 ? (
            <Text style={[styles.stock, { color: colors.danger }]}>Out of stock</Text>
          ) : stock < 10 ? (
            <Text style={[styles.stock, { color: '#B45309' }]}>Hurry! Only {stock} left</Text>
          ) : (
            <Text style={[styles.stock, { color: colors.success }]}>In stock</Text>
          )}

          {/* Variant attribute selectors */}
          {attrKeys.map((key: string) => {
            const values = Array.from(new Set(product.variants.map((v: ProductVariant) => v.attributes?.[key]).filter(Boolean))) as string[];
            return (
              <View key={key} style={{ marginTop: spacing.lg }}>
                <Text style={styles.attrLabel}>{key[0].toUpperCase() + key.slice(1)}: <Text style={styles.attrVal}>{selected?.attributes?.[key]}</Text></Text>
                <View style={styles.chips}>
                  {values.map((val: string) => {
                    const active = selected?.attributes?.[key] === val;
                    return (
                      <Pressable key={val}
                        onPress={() => setVariant(product.variants.find((v: ProductVariant) => v.attributes?.[key] === val) ?? selected)}
                        style={[styles.chip, active && styles.chipActive]}>
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{val}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <Text style={styles.descTitle}>Description</Text>
          <Text style={styles.desc}>{product.description}</Text>

          {/* Reviews */}
          <View style={styles.reviewsHead}>
            <Text style={styles.descTitle}>Reviews</Text>
            {product.ratings.count > 0 && (
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={12} color={colors.primary} />
                <Text style={styles.ratingText}>{product.ratings.average} ({product.ratings.count})</Text>
              </View>
            )}
          </View>
          {!reviews?.length ? (
            <Text style={styles.noReviews}>No reviews yet.</Text>
          ) : (
            reviews.slice(0, 5).map((r: Review) => (
              <View key={r._id} style={styles.review}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewName}>{r.user?.name}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={11} color={s <= r.rating ? colors.primary : colors.border} />
                    ))}
                  </View>
                </View>
                {!!r.title && <Text style={styles.reviewTitle}>{r.title}</Text>}
                <Text style={styles.reviewBody}>{r.body}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.wish} onPress={() => requireAuth(() => toggle.mutate(product._id))}>
          <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={22} color={wishlisted ? colors.primary : colors.text} />
        </Pressable>
        <Pressable
          style={[styles.addBtn, (stock <= 0 || add.isPending) && { opacity: 0.5 }]}
          disabled={stock <= 0 || add.isPending}
          onPress={onAddToCart}
        >
          <Ionicons name="bag-outline" size={18} color={colors.white} />
          <Text style={styles.addText}>{stock <= 0 ? 'Out of Stock' : add.isPending ? 'Adding…' : 'Add to Bag'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80 },
  discBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  discText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.white },
  body: { paddingHorizontal: spacing.lg, paddingTop: 0, paddingBottom: spacing.lg, marginTop: -8 },
  category: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  price: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text },
  mrp: { fontFamily: fonts.body, fontSize: 16, color: colors.muted, textDecorationLine: 'line-through' },
  off: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.success },
  stock: { fontFamily: fonts.bodySemibold, fontSize: 13, marginTop: 10 },
  attrLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
  attrVal: { color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 14, paddingVertical: 9, minWidth: 44, alignItems: 'center' },
  chipActive: { borderColor: colors.text, backgroundColor: colors.text },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.white },
  descTitle: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text, marginTop: spacing.xl, marginBottom: 6 },
  desc: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, lineHeight: 22 },
  reviewsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  ratingText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.text },
  noReviews: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 8 },
  review: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  reviewTitle: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text, marginTop: 4 },
  reviewBody: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 19 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: spacing.lg, backgroundColor: colors.white, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, ...shadow.card },
  wish: { width: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.full },
  addBtn: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 15 },
  addText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.white },
});
