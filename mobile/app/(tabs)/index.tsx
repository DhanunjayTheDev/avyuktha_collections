import { useCallback, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import ProductCard from '../../src/components/ProductCard';
import NewsletterCard from '../../src/components/NewsletterCard';
import InfiniteMarquee from '../../src/components/InfiniteMarquee';
import HeroCarousel, { type Slide } from '../../src/components/HeroCarousel';
import LocationSheet from '../../src/components/LocationSheet';
import LocationPermissionModal from '../../src/components/LocationPermissionModal';
import * as Location from 'expo-location';
import { useProducts, useCategories, useCollections, useProductTypes } from '../../src/api/catalog';
import { useAuth } from '../../src/store/auth';
import { useDelivery } from '../../src/store/delivery';
import { recentlyViewed, type MiniProduct } from '../../src/lib/recentlyViewed';
import { categoryImage } from '../../src/lib/categoryImage';
import { formatPrice } from '../../src/utils/format';
import { colors, fonts, radii, spacing, shadow } from '../../src/theme';
import type { Product, Category, ProductType } from '../../src/types';

const CARD_W = 150;
const MARQUEE = ['Silk Sarees', 'Designer Kurtis', 'Bridal Lehengas', '1 Gram Gold', 'Festive Edit', 'Free Shipping ₹999+'];

const PROMOS = [
  { title: 'New Arrivals', sub: 'Fresh drops', img: `https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80`, href: '/search?isNewArrival=true' },
  { title: 'Jewellery', sub: '1 Gram Gold', img: `https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80`, href: '/search?productType=jewellery' },
];

function SectionHead({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && <Pressable onPress={onSeeAll}><Text style={styles.seeAll}>See all</Text></Pressable>}
    </View>
  );
}

function Rail({ title, query, onSeeAll }: { title: string; query: object; onSeeAll: () => void }) {
  const { data, isLoading } = useProducts({ ...query, limit: 10 });
  const products = data?.data ?? [];
  if (!isLoading && products.length === 0) return null;
  return (
    <View style={{ marginTop: spacing.xl }}>
      <SectionHead title={title} onSeeAll={onSeeAll} />
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
      ) : (
        <FlatList data={products} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(p) => p._id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 12 }}
          renderItem={({ item }: { item: Product }) => <ProductCard product={item} width={CARD_W} />} />
      )}
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: cats } = useCategories();
  const { data: cols } = useCollections();
  const { data: ptypes } = useProductTypes();
  const categories = cats ?? [];
  const collections = cols ?? [];
  const types = ptypes ?? [];
  const delivery = useDelivery((s) => s.selected);
  const currentLabel = useDelivery((s) => s.currentLabel);
  const [recent, setRecent] = useState<MiniProduct[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [permVisible, setPermVisible] = useState(false);

  useFocusEffect(useCallback(() => { recentlyViewed.get().then(setRecent); }, []));

  // Tap "Deliver to": prime permission (modern modal) if not yet granted,
  // otherwise open the location sheet directly.
  const openDelivery = async () => {
    const perm = await Location.getForegroundPermissionsAsync();
    if (perm.granted) setSheetOpen(true);
    else setPermVisible(true);
  };

  const slides: Slide[] = [
    { image: 'https://images.unsplash.com/photo-1614093302611-8efc4c438a87?w=1000&q=80', label: 'NEW COLLECTION 2026', title: 'Elegance\nRedefined', cta: 'Shop Now', onPress: () => router.push('/search?isNewArrival=true') },
    { image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=80', label: 'WEDDING EDIT', title: 'Handwoven\nSilks', cta: 'Explore', onPress: () => router.push('/search?productType=clothing') },
    { image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=80', label: '1 GRAM GOLD', title: 'Jewellery\nThat Shines', cta: 'View Edit', onPress: () => router.push('/search?productType=jewellery') },
    { image: 'https://images.unsplash.com/photo-1573408301185-9519f06e0f96?w=1000&q=80', label: 'BANGLES & BRACELETS', title: 'Stack &\nShinе', cta: 'Shop Bangles', onPress: () => router.push('/search?category=bangles') },
  ];

  return (
    <Screen>
      {/* Delivery row */}
      <Pressable style={styles.deliverRow} onPress={openDelivery}>
        <Ionicons name="location-outline" size={16} color={colors.primary} />
        <Text style={styles.deliverText} numberOfLines={1}>
          Deliver to <Text style={styles.deliverName}>{delivery ? `${delivery.label} · ${delivery.city}` : currentLabel ?? (isAuthenticated ? user?.name : 'Set location')}</Text>
        </Text>
        <Ionicons name="chevron-down" size={15} color={colors.muted} />
      </Pressable>

      {/* Search + notifications */}
      <View style={styles.searchRow}>
        <Pressable style={styles.search} onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={17} color={colors.muted} />
          <Text style={styles.searchPlaceholder}>Search for sarees, chains, dresses…</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/notifications')} style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <LocationPermissionModal
        visible={permVisible}
        onResult={() => { setPermVisible(false); setSheetOpen(true); }}
        onSkip={() => { setPermVisible(false); setSheetOpen(true); }}
      />
      <LocationSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Category circles */}
        {types.length > 0 && (
          <FlatList
            data={types}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(t) => t._id}
            style={{ flexGrow: 0, marginTop: spacing.sm }}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 18, paddingVertical: spacing.sm }}
            renderItem={({ item }: { item: ProductType }) => (
              <Pressable style={styles.circleWrap} onPress={() => router.push(`/search?productType=${item.slug}`)}>
                <View style={styles.circle}>
                  <Image source={{ uri: categoryImage(item.name) }} style={styles.circleImg} contentFit="cover" />
                </View>
                <Text style={styles.circleName} numberOfLines={1}>{item.name}</Text>
              </Pressable>
            )}
          />
        )}

        {/* Hero carousel */}
        <View style={{ marginTop: spacing.sm }}>
          <HeroCarousel slides={slides} />
        </View>

        {/* Marquee */}
        <View style={{ marginTop: spacing.lg }}>
          <InfiniteMarquee items={MARQUEE} speed={45} />
        </View>

        {/* New Arrivals */}
        <Rail title="New Arrivals" query={{ isNewArrival: true }} onSeeAll={() => router.push('/search?isNewArrival=true')} />

        {/* Shop by Category */}
        {categories.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <SectionHead title="Shop by Category" onSeeAll={() => router.push('/(tabs)/categories')} />
            <FlatList data={categories} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(c) => c._id}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 12 }}
              renderItem={({ item, index }: { item: Category; index: number }) => (
                <Pressable style={styles.catCard} onPress={() => router.push(`/search?category=${item.slug}`)}>
                  <Image source={{ uri: item.image || categoryImage(item.name, index) }} style={styles.catImg} contentFit="cover" />
                  <View style={styles.catScrim} />
                  <Text style={styles.catName}>{item.name}</Text>
                </Pressable>
              )} />
          </View>
        )}

        {/* Promo banner pair */}
        <View style={styles.promoRow}>
          {PROMOS.map((p) => (
            <Pressable key={p.title} style={[styles.promo, shadow.soft]} onPress={() => router.push(p.href as never)}>
              <Image source={{ uri: p.img }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <View style={styles.promoScrim} />
              <View style={styles.promoBody}>
                <Text style={styles.promoSub}>{p.sub}</Text>
                <Text style={styles.promoTitle}>{p.title}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Best Sellers */}
        <Rail title="Best Sellers" query={{ isBestSeller: true }} onSeeAll={() => router.push('/search?isBestSeller=true')} />

        {/* Collections */}
        {collections.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <SectionHead title="Collections" />
            <FlatList data={collections} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(c) => c._id}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 12 }}
              renderItem={({ item }) => (
                <Pressable style={styles.colCard} onPress={() => router.push(`/search?collection=${item.slug}`)}>
                  <Image source={{ uri: item.bannerImage || item.image || categoryImage(item.name) }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <View style={styles.catScrim} />
                  <Text style={styles.colName}>{item.name}</Text>
                </Pressable>
              )} />
          </View>
        )}

        {/* Trending */}
        <Rail title="Trending Now" query={{ isTrending: true }} onSeeAll={() => router.push('/search?isTrending=true')} />

        {/* Recently viewed */}
        {recent.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <SectionHead title="Recently Viewed" />
            <FlatList data={recent} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(p) => p._id}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 12 }}
              renderItem={({ item }) => (
                <Pressable style={{ width: CARD_W }} onPress={() => router.push(`/product/${item.slug}`)}>
                  <Image source={{ uri: item.images?.[0] }} style={styles.recentImg} contentFit="cover" />
                  <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.recentPrice}>{formatPrice(item.salePrice)}</Text>
                </Pressable>
              )} />
          </View>
        )}

        {/* Journal */}
        <Pressable style={styles.journal} onPress={() => router.push('/blog')}>
          <Text style={styles.journalLabel}>FASHION STORIES</Text>
          <Text style={styles.journalTitle}>Read the Journal</Text>
          <View style={styles.journalArrow}><Ionicons name="arrow-forward" size={16} color={colors.white} /></View>
        </Pressable>

        <NewsletterCard />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  deliverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 4 },
  deliverText: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  deliverName: { fontFamily: fonts.bodySemibold, color: colors.text },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingVertical: 6 },
  search: { flex: 1, height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, paddingHorizontal: 14 },
  searchPlaceholder: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  iconBtn: { width: 30, alignItems: 'center' },
  // circles
  circleWrap: { alignItems: 'center', width: 70 },
  circle: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  circleImg: { width: '100%', height: '100%' },
  circleName: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.text, marginTop: 6, textAlign: 'center' },
  // sections
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text },
  seeAll: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.primary },
  // shop by category
  catCard: { width: 130, height: 170, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.surface },
  catImg: { ...StyleSheet.absoluteFillObject },
  catScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,28,28,0.30)' },
  catName: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.white, padding: spacing.md },
  // promos
  promoRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  promo: { flex: 1, height: 150, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.surface },
  promoScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,28,28,0.35)' },
  promoBody: { padding: spacing.md },
  promoSub: { fontFamily: fonts.body, fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  promoTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.white },
  // collections
  colCard: { width: 220, height: 130, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.surface },
  colName: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.white, padding: spacing.md },
  // recently
  recentImg: { width: '100%', aspectRatio: 3 / 4, borderRadius: radii.md, backgroundColor: colors.surface },
  recentName: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.text, marginTop: 6 },
  recentPrice: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 2 },
  // journal
  journal: { margin: spacing.lg, marginTop: spacing.xxl, height: 120, borderRadius: radii.lg, backgroundColor: colors.secondary, padding: spacing.lg, justifyContent: 'center' },
  journalLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.white, letterSpacing: 2 },
  journalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.white, marginTop: 4 },
  journalArrow: { position: 'absolute', right: spacing.lg, top: '50%', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
});
