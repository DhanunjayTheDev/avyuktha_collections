import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii, shadow } from '../theme';
import { formatPrice } from '../utils/format';
import { useWishlist, useToggleWishlist } from '../api/wishlist';
import { useAuth } from '../store/auth';
import type { Product } from '../types';

export default function ProductCard({ product, width }: { product: Product; width: number }) {
  const router = useRouter();
  const isAuth = useAuth((s) => s.isAuthenticated);
  const { data: wishlist } = useWishlist();
  const toggle = useToggleWishlist();
  const wishlisted = !!wishlist?.some((p: Product) => p._id === product._id);

  const onHeart = () => {
    if (!isAuth) { router.push('/(auth)/login'); return; }
    toggle.mutate(product._id);
  };

  return (
    <Pressable style={[styles.card, { width }]} onPress={() => router.push(`/product/${product.slug}`)}>
      <Image
        source={{ uri: product.images?.[0] }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <Pressable style={styles.heart} onPress={onHeart} hitSlop={8}>
        <Ionicons name={wishlisted ? 'heart' : 'heart-outline'} size={16} color={wishlisted ? colors.primary : colors.text} />
      </Pressable>
      {product.discountPercentage > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>-{product.discountPercentage}%</Text>
        </View>
      )}
      <Text style={styles.category} numberOfLines={1}>{product.category?.name}</Text>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatPrice(product.salePrice)}</Text>
        {product.mrp > product.salePrice && (
          <Text style={styles.mrp}>{formatPrice(product.mrp)}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 18 },
  image: { width: '100%', aspectRatio: 3 / 4, borderRadius: radii.lg, backgroundColor: colors.surface, ...shadow.soft },
  heart: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.sm },
  badgeText: { color: colors.white, fontSize: 10, fontFamily: fonts.bodySemibold },
  category: { marginTop: 8, fontSize: 10, color: colors.muted, fontFamily: fonts.body, textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { marginTop: 2, fontSize: 13, color: colors.text, fontFamily: fonts.bodyMedium, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  price: { fontSize: 14, color: colors.text, fontFamily: fonts.bodySemibold },
  mrp: { fontSize: 12, color: colors.muted, textDecorationLine: 'line-through', fontFamily: fonts.body },
});
