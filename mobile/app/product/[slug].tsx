import { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, useWindowDimensions, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProduct, useProducts } from '../../src/api/catalog';
import { useProductReviews, type Review } from '../../src/api/content';
import { recentlyViewed } from '../../src/lib/recentlyViewed';
import { useCart, useCartMutations, cartTotals } from '../../src/api/cart';
import { useWishlist, useToggleWishlist } from '../../src/api/wishlist';
import { useAuth } from '../../src/store/auth';
import { useDelivery } from '../../src/store/delivery';
import { useAddresses } from '../../src/api/account';
import ProductCard from '../../src/components/ProductCard';
import LocationSheet from '../../src/components/LocationSheet';
import { colors, fonts, radii, spacing, shadow } from '../../src/theme';
import { formatPrice } from '../../src/utils/format';
import type { Product, ProductVariant } from '../../src/types';

const isColorKey = (k: string) => /colou?r/i.test(k);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ProductDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data: product, isLoading } = useProduct(slug);
  const isAuth = useAuth((s) => s.isAuthenticated);
  const delivery = useDelivery((s) => s.selected);
  const setDelivery = useDelivery((s) => s.setSelected);
  const { data: addresses } = useAddresses();
  const [addrSheet, setAddrSheet] = useState(false);

  // Auto-pick the saved/default address if none chosen yet (carries over from home).
  useEffect(() => {
    if (!delivery && addresses?.length) setDelivery(addresses.find((a) => a.isDefault) ?? addresses[0]);
  }, [addresses, delivery]);

  const { add, update, remove } = useCartMutations();
  const { data: cart } = useCart();
  const { count: cartCount } = cartTotals(cart);
  const { data: wishlist } = useWishlist();
  const { data: reviews } = useProductReviews(product?._id ?? '');
  const { data: relatedData } = useProducts({ category: product?.category?.slug, limit: 8 });
  const toggle = useToggleWishlist();
  const wishCount = wishlist?.length ?? 0;

  // selection per variant attribute
  const [sel, setSel] = useState<Record<string, string>>({});
  const [imgIndex, setImgIndex] = useState(0);

  const attrKeys = useMemo(
    () => Array.from(new Set((product?.variants ?? []).flatMap((v) => Object.keys(v.attributes ?? {})))),
    [product]
  );

  // resolve selected variant from current selections; fall back to first
  const selectedVariant: ProductVariant | null = useMemo(() => {
    if (!product?.variants?.length) return null;
    const match = product.variants.find((v) =>
      attrKeys.every((k) => !sel[k] || v.attributes?.[k] === sel[k])
    );
    return match ?? product.variants[0];
  }, [product, sel, attrKeys]);

  // default selection to first variant once product loads
  useEffect(() => {
    if (product?.variants?.[0]?.attributes) setSel(product.variants[0].attributes);
  }, [product?._id]);

  useEffect(() => { if (product) void recentlyViewed.add(product); }, [product?._id]);

  const wishlisted = !!wishlist?.some((p: Product) => p._id === product?._id);

  const requireAuth = (fn: () => void) => {
    if (!isAuth) { router.push('/(auth)/login'); return; }
    fn();
  };

  if (isLoading || !product) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const images = (selectedVariant?.images?.length ? selectedVariant.images : product.images) ?? [];
  const stock = selectedVariant?.stock ?? 0;
  const cartItem = cart?.items?.find((i) => i.product._id === product._id && i.variantSku === selectedVariant?.sku);

  const colorKey = attrKeys.find(isColorKey);
  const sizeKeys = attrKeys.filter((k) => !isColorKey(k));

  // unique color values -> representative image
  const colorOptions = colorKey
    ? Array.from(new Set(product.variants.map((v) => v.attributes?.[colorKey]).filter(Boolean) as string[]))
        .map((val) => ({ val, img: product.variants.find((v) => v.attributes?.[colorKey] === val)?.images?.[0] ?? product.images?.[0] }))
    : [];

  const pickAttr = (key: string, val: string) => {
    setSel((prev) => {
      const next = { ...prev, [key]: val };
      // snap to a real variant that satisfies the new pick
      const v = product.variants.find((x) => x.attributes?.[key] === val && attrKeys.every((k) => k === key || !prev[k] || x.attributes?.[k] === prev[k]))
        ?? product.variants.find((x) => x.attributes?.[key] === val);
      return v?.attributes ? { ...v.attributes } : next;
    });
    setImgIndex(0);
  };

  const stockFor = (key: string, val: string) =>
    product.variants
      .filter((v) => v.attributes?.[key] === val && (!colorKey || key === colorKey || v.attributes?.[colorKey] === sel[colorKey]))
      .reduce((s, v) => s + v.stock, 0);

  const addToCart = (then?: () => void) => requireAuth(() => {
    if (!selectedVariant) return;
    add.mutate({ productId: product._id, variantSku: selectedVariant.sku, quantity: 1 }, { onSuccess: then });
  });

  const changeQty = (delta: number) => {
    if (!cartItem || !selectedVariant) return;
    const next = cartItem.quantity + delta;
    if (next <= 0) remove.mutate({ productId: product._id, variantSku: selectedVariant.sku });
    else update.mutate({ productId: product._id, variantSku: selectedVariant.sku, quantity: next });
  };

  const buyNow = () => addToCart(() => router.push('/checkout'));

  // product-level attribute specs (Record<string,string[]>)
  const specs = Object.entries(product.attributes ?? {}).filter(([, v]) => v?.length);
  const related = (relatedData?.data ?? []).filter((p) => p._id !== product._id).slice(0, 6);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Safe-area header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.hIcon}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Pressable style={styles.headSearch} onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={16} color={colors.muted} />
          <Text style={styles.headSearchText}>Search for products</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/wishlist')} hitSlop={8} style={styles.hIcon}>
          <Ionicons name="heart-outline" size={22} color={colors.text} />
          {wishCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{wishCount}</Text></View>}
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/cart')} hitSlop={8} style={styles.hIcon}>
          <Ionicons name="bag-outline" size={22} color={colors.text} />
          {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Image carousel */}
        <View>
          <FlatList
            data={images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width, aspectRatio: 3 / 4, backgroundColor: colors.surface }} contentFit="cover" transition={150} />
            )}
          />
          {product.discountPercentage > 0 && (
            <View style={styles.discBadge}><Text style={styles.discText}>-{product.discountPercentage}%</Text></View>
          )}
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />)}
            </View>
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

          {stock <= 0 ? <Text style={[styles.stock, { color: colors.danger }]}>Out of stock</Text>
            : stock < 10 ? <Text style={[styles.stock, { color: '#B45309' }]}>Hurry! Only {stock} left</Text>
            : <Text style={[styles.stock, { color: colors.success }]}>In stock</Text>}

          {/* Colour thumbnails */}
          {colorKey && colorOptions.length > 0 && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={styles.attrLabel}>Colour: <Text style={styles.attrVal}>{sel[colorKey]}</Text></Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 10 }}>
                {colorOptions.map((c) => {
                  const active = sel[colorKey] === c.val;
                  return (
                    <Pressable key={c.val} onPress={() => pickAttr(colorKey, c.val)} style={[styles.colorThumb, active && styles.colorThumbActive]}>
                      <Image source={{ uri: c.img }} style={styles.colorImg} contentFit="cover" />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Size / other variant selectors */}
          {sizeKeys.map((key) => {
            const values = Array.from(new Set(product.variants.map((v) => v.attributes?.[key]).filter(Boolean))) as string[];
            return (
              <View key={key} style={{ marginTop: spacing.lg }}>
                <Text style={styles.attrLabel}>{cap(key)}: <Text style={styles.attrVal}>{sel[key]}</Text></Text>
                <View style={styles.chips}>
                  {values.map((val) => {
                    const active = sel[key] === val;
                    const left = stockFor(key, val);
                    return (
                      <Pressable key={val} disabled={left <= 0} onPress={() => pickAttr(key, val)}
                        style={[styles.sizeBox, active && styles.sizeBoxActive, left <= 0 && styles.sizeBoxDisabled]}>
                        <Text style={[styles.sizeText, active && styles.sizeTextActive, left <= 0 && styles.sizeTextDisabled]}>{val}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {/* Delivery & Services */}
          <Text style={styles.sectionTitle}>Delivery & Services</Text>
          <Pressable style={styles.addrRow} onPress={() => setAddrSheet(true)}>
            <Ionicons name="location-outline" size={18} color={colors.text} />
            <View style={{ flex: 1 }}>
              {delivery ? (
                <>
                  <Text style={styles.addrLabel}>Deliver to {delivery.fullName} · {delivery.pincode}</Text>
                  <Text style={styles.addrText} numberOfLines={1}>{delivery.line1}, {delivery.city}</Text>
                </>
              ) : (
                <Text style={styles.addrText}>Select a delivery address</Text>
              )}
            </View>
            <Text style={styles.change}>Change</Text>
          </Pressable>
          <View style={styles.serviceRow}><Ionicons name="cube-outline" size={16} color={colors.success} /><Text style={styles.serviceText}>Free delivery on orders above ₹999</Text></View>
          <View style={styles.serviceRow}><Ionicons name="sync-outline" size={16} color={colors.success} /><Text style={styles.serviceText}>14 days easy return & exchange</Text></View>
          <View style={styles.serviceRow}><Ionicons name="cash-outline" size={16} color={colors.success} /><Text style={styles.serviceText}>Pay on delivery available</Text></View>

          {/* Specs */}
          {specs.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <View style={styles.specCard}>
                {specs.map(([k, v]) => (
                  <View key={k} style={styles.specRow}>
                    <Text style={styles.specKey}>{cap(k)}</Text>
                    <Text style={styles.specVal}>{v.join(', ')}</Text>
                  </View>
                ))}
                {product.weightGrams ? (
                  <View style={styles.specRow}><Text style={styles.specKey}>Weight</Text><Text style={styles.specVal}>{product.weightGrams} g</Text></View>
                ) : null}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>{product.description}</Text>

          {/* Reviews */}
          <View style={styles.reviewsHead}>
            <Text style={styles.sectionTitle}>Reviews</Text>
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
                    {[1, 2, 3, 4, 5].map((s) => <Ionicons key={s} name="star" size={11} color={s <= r.rating ? colors.primary : colors.border} />)}
                  </View>
                </View>
                {!!r.title && <Text style={styles.reviewTitle}>{r.title}</Text>}
                <Text style={styles.reviewBody}>{r.body}</Text>
              </View>
            ))
          )}
        </View>

        {/* Related products */}
        {related.length > 0 && (
          <View style={{ marginTop: spacing.md }}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.lg }]}>You may also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md, paddingTop: 8 }}>
              {related.map((p) => <ProductCard key={p._id} product={p} width={150} />)}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: (insets.bottom || 10) }]}>
        <Pressable style={styles.wish} onPress={() => requireAuth(() => toggle.mutate(product._id))}>
          <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={22} color={wishlisted ? colors.primary : colors.text} />
        </Pressable>

        {cartItem ? (
          <>
            <View style={styles.stepper}>
              <Pressable style={styles.stepBtn} onPress={() => changeQty(-1)}>
                <Ionicons name={cartItem.quantity <= 1 ? 'trash-outline' : 'remove'} size={18} color={colors.text} />
              </Pressable>
              <Text style={styles.stepQty}>{cartItem.quantity}</Text>
              <Pressable style={styles.stepBtn} disabled={cartItem.quantity >= stock} onPress={() => changeQty(1)}>
                <Ionicons name="add" size={18} color={cartItem.quantity >= stock ? colors.muted : colors.text} />
              </Pressable>
            </View>
            <Pressable style={styles.primaryBtn} onPress={() => router.push('/(tabs)/cart')}>
              <Ionicons name="bag-check-outline" size={18} color={colors.white} />
              <Text style={styles.primaryText}>Go to Bag</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={[styles.outlineBtn, stock <= 0 && { opacity: 0.4 }]} disabled={stock <= 0} onPress={buyNow}>
              <Text style={styles.outlineText}>Buy Now</Text>
            </Pressable>
            <Pressable style={[styles.primaryBtn, (stock <= 0 || add.isPending) && { opacity: 0.5 }]} disabled={stock <= 0 || add.isPending} onPress={() => addToCart()}>
              <Ionicons name="bag-outline" size={18} color={colors.white} />
              <Text style={styles.primaryText}>{stock <= 0 ? 'Out of Stock' : add.isPending ? 'Adding…' : 'Add to Bag'}</Text>
            </Pressable>
          </>
        )}
      </View>

      <LocationSheet visible={addrSheet} onClose={() => setAddrSheet(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, ...shadow.soft },
  hIcon: { padding: 6 },
  headSearch: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, paddingHorizontal: 14, height: 38 },
  headSearchText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  badge: { position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 9, color: colors.white },
  discBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full },
  discText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.white },
  dots: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.25)' },
  dotActive: { backgroundColor: colors.text, width: 18 },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  category: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  price: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text },
  mrp: { fontFamily: fonts.body, fontSize: 15, color: colors.muted, textDecorationLine: 'line-through' },
  off: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.success },
  stock: { fontFamily: fonts.bodySemibold, fontSize: 13, marginTop: 8 },
  attrLabel: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  attrVal: { color: colors.muted, fontFamily: fonts.body },
  colorThumb: { width: 58, height: 74, borderRadius: radii.md, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  colorThumbActive: { borderColor: colors.primary },
  colorImg: { width: '100%', height: '100%', backgroundColor: colors.surface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  sizeBox: { minWidth: 52, height: 52, paddingHorizontal: 12, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  sizeBoxActive: { borderColor: colors.text, backgroundColor: colors.text },
  sizeBoxDisabled: { backgroundColor: colors.surface, borderColor: colors.border },
  sizeText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  sizeTextActive: { color: colors.white },
  sizeTextDisabled: { color: colors.muted, textDecorationLine: 'line-through' },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.text, marginTop: spacing.xl, marginBottom: 8 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: 14 },
  addrLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  addrText: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  change: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.primary },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  serviceText: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  specCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: 14, gap: 10 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  specKey: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.muted },
  specVal: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text, flex: 1, textAlign: 'right' },
  desc: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, lineHeight: 22 },
  reviewsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full, marginTop: spacing.xl },
  ratingText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.text },
  noReviews: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 4 },
  review: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  reviewTitle: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text, marginTop: 4 },
  reviewBody: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 19 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.white, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, ...shadow.card },
  wish: { width: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.full },
  outlineBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.text, borderRadius: radii.full, paddingVertical: 14 },
  outlineText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  primaryBtn: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 14 },
  primaryText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.white },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, paddingHorizontal: 4 },
  stepBtn: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepQty: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, minWidth: 24, textAlign: 'center' },
});
