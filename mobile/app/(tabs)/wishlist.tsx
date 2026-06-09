import { View, Text, FlatList, Pressable, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import EmptyState from '../../src/components/EmptyState';
import { useAuth } from '../../src/store/auth';
import { useWishlist, useToggleWishlist } from '../../src/api/wishlist';
import { useCartMutations } from '../../src/api/cart';
import { colors, fonts, radii, spacing } from '../../src/theme';
import { formatPrice } from '../../src/utils/format';
import type { Product } from '../../src/types';

export default function Wishlist() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isAuth = useAuth((s) => s.isAuthenticated);
  const { data: products, isLoading } = useWishlist();
  const toggle = useToggleWishlist();
  const { add } = useCartMutations();
  const col = (width - spacing.lg * 3) / 2;

  if (!isAuth) {
    return (
      <Screen>
        <Text style={styles.header}>Wishlist</Text>
        <EmptyState icon="heart-outline" title="Sign in to view your wishlist"
          ctaText="Sign In" onCta={() => router.push('/(auth)/login')} />
      </Screen>
    );
  }
  if (isLoading) {
    return <Screen><Text style={styles.header}>Wishlist</Text><ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /></Screen>;
  }
  if (!products?.length) {
    return (
      <Screen>
        <Text style={styles.header}>Wishlist</Text>
        <EmptyState icon="heart-outline" title="Your wishlist is empty"
          subtitle="Tap the heart on any product to save it." ctaText="Browse" onCta={() => router.push('/(tabs)')} />
      </Screen>
    );
  }

  const moveToCart = (p: Product) => {
    const v = p.variants?.find((x) => x.stock > 0) ?? p.variants?.[0];
    if (!v) return;
    add.mutate({ productId: p._id, variantSku: v.sku, quantity: 1 });
    toggle.mutate(p._id);
  };

  return (
    <Screen>
      <Text style={styles.header}>Wishlist ({products.length})</Text>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(p) => p._id}
        columnWrapperStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ paddingBottom: 32, gap: spacing.lg, paddingTop: spacing.sm }}
        renderItem={({ item }) => (
          <View style={{ width: col }}>
            <Pressable onPress={() => router.push(`/product/${item.slug}`)}>
              <Image source={{ uri: item.images?.[0] }} style={styles.img} contentFit="cover" />
              <Pressable style={styles.heart} onPress={() => toggle.mutate(item._id)}>
                <Ionicons name="heart" size={16} color={colors.primary} />
              </Pressable>
            </Pressable>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.price}>{formatPrice(item.salePrice)}</Text>
            <Pressable style={styles.addBtn} onPress={() => moveToCart(item)}>
              <Text style={styles.addText}>Move to Bag</Text>
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, padding: spacing.lg },
  img: { width: '100%', aspectRatio: 3 / 4, borderRadius: radii.md, backgroundColor: colors.surface },
  heart: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text, marginTop: 8 },
  price: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text, marginTop: 2 },
  addBtn: { marginTop: 8, borderWidth: 1, borderColor: colors.text, borderRadius: radii.full, paddingVertical: 9, alignItems: 'center' },
  addText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.text },
});
