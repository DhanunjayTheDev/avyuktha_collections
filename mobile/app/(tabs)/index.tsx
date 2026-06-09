import { useCallback, useState } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import ProductCard from '../../src/components/ProductCard';
import NewsletterCard from '../../src/components/NewsletterCard';
import { useProducts, useCategories, useCollections } from '../../src/api/catalog';
import { recentlyViewed, type MiniProduct } from '../../src/lib/recentlyViewed';
import { formatPrice } from '../../src/utils/format';
import { colors, fonts, radii, spacing } from '../../src/theme';
import type { Product, Category } from '../../src/types';

const CARD_W = 150;
const MARQUEE = ['Silk Sarees', 'Designer Kurtis', 'Bridal Lehengas', '1 Gram Gold', 'Festive Edit', 'Free Shipping ₹999+'];

const BANNERS = [
  { label: 'Crafted in Silk', title: 'The Wedding Collection', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=80', href: '/search?productType=jewellery', cta: 'Explore' },
  { label: 'Festive Season', title: 'Celebrate in Colour', img: 'https://images.unsplash.com/photo-1614093302611-8efc4c438a87?w=1000&q=80', href: '/search?isTrending=true', cta: 'Shop Festive' },
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

function Banner({ b, onPress }: { b: (typeof BANNERS)[number]; onPress: () => void }) {
  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <Image source={{ uri: b.img }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.bannerOverlay} />
      <View style={styles.bannerContent}>
        <Text style={styles.bannerLabel}>{b.label}</Text>
        <Text style={styles.bannerTitle}>{b.title}</Text>
        <View style={styles.bannerBtn}><Text style={styles.bannerBtnText}>{b.cta}</Text></View>
      </View>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data: cats } = useCategories();
  const { data: cols } = useCollections();
  const categories = cats ?? [];
  const collections = cols ?? [];
  const [recent, setRecent] = useState<MiniProduct[]>([]);

  useFocusEffect(useCallback(() => { recentlyViewed.get().then(setRecent); }, []));

  return (
    <Screen>
      {/* Top bar */}
      <View style={styles.topbar}>
        <View>
          <Text style={styles.logo}>AVYUKTHA</Text>
          <Text style={styles.logoSub}>FASHIONS</Text>
        </View>
        <View style={styles.icons}>
          <Pressable onPress={() => router.push('/search')}><Ionicons name="search-outline" size={22} color={colors.text} /></Pressable>
          <Pressable onPress={() => router.push('/notifications')}><Ionicons name="notifications-outline" size={22} color={colors.text} /></Pressable>
          <Pressable onPress={() => router.push('/(tabs)/cart')}><Ionicons name="bag-outline" size={22} color={colors.text} /></Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Announcement */}
        <Pressable style={styles.announce} onPress={() => router.push('/search?isNewArrival=true')}>
          <Text style={styles.announceText}>✦ FREE SHIPPING ON ORDERS ABOVE ₹999 ✦</Text>
        </Pressable>

        {/* Hero */}
        <Pressable style={styles.hero} onPress={() => router.push('/(tabs)/categories')}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=1000&q=80' }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>NEW COLLECTION 2026</Text>
            <Text style={styles.heroTitle}>Elegance{'\n'}Redefined</Text>
            <View style={styles.heroBtn}><Text style={styles.heroBtnText}>Shop Now</Text></View>
          </View>
        </Pressable>

        {/* Marquee */}
        <FlatList data={MARQUEE} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(m) => m}
          style={styles.marquee} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 0, alignItems: 'center' }}
          renderItem={({ item }) => <Text style={styles.marqueeItem}>{item}  ✦  </Text>} />

        {/* New Arrivals */}
        <Rail title="New Arrivals" query={{ isNewArrival: true }} onSeeAll={() => router.push('/search?isNewArrival=true')} />

        {/* Shop by Category (circles) */}
        {categories.length > 0 && (
          <View style={{ marginTop: spacing.xl }}>
            <SectionHead title="Shop by Category" onSeeAll={() => router.push('/(tabs)/categories')} />
            <FlatList data={categories} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(c) => c._id}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 16 }}
              renderItem={({ item }: { item: Category }) => (
                <Pressable style={styles.catCircleWrap} onPress={() => router.push(`/search?category=${item.slug}`)}>
                  <View style={styles.catCircle}>
                    {item.image ? <Image source={{ uri: item.image }} style={styles.catCircleImg} contentFit="cover" />
                      : <Text style={styles.catInitial}>{item.name[0]}</Text>}
                  </View>
                  <Text style={styles.catCircleName} numberOfLines={1}>{item.name}</Text>
                </Pressable>
              )} />
          </View>
        )}

        {/* Banner 1 */}
        <Banner b={BANNERS[0]} onPress={() => router.push(BANNERS[0].href as never)} />

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
                  <Image source={{ uri: item.bannerImage || item.image }} style={styles.colImg} contentFit="cover" />
                  <View style={styles.colOverlay} />
                  <Text style={styles.colName}>{item.name}</Text>
                </Pressable>
              )} />
          </View>
        )}

        {/* Banner 2 */}
        <Banner b={BANNERS[1]} onPress={() => router.push(BANNERS[1].href as never)} />

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

        {/* Newsletter */}
        <NewsletterCard />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  logo: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, letterSpacing: 2 },
  logoSub: { fontFamily: fonts.body, fontSize: 8, color: colors.primary, letterSpacing: 4 },
  icons: { flexDirection: 'row', gap: 18 },
  announce: { backgroundColor: colors.primary, paddingVertical: 8, alignItems: 'center' },
  announceText: { color: colors.white, fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 1 },
  hero: { margin: spacing.lg, height: 380, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  heroContent: { padding: spacing.xl },
  heroLabel: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.white, letterSpacing: 2 },
  heroTitle: { fontFamily: fonts.headingBold, fontSize: 40, color: colors.white, marginTop: 6, lineHeight: 44 },
  heroBtn: { marginTop: 16, alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radii.full, paddingHorizontal: 24, paddingVertical: 12 },
  heroBtnText: { color: colors.text, fontFamily: fonts.bodySemibold, fontSize: 13 },
  marquee: { marginTop: spacing.lg, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 12 },
  marqueeItem: { fontFamily: fonts.heading, fontSize: 16, color: colors.primary },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text },
  seeAll: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.primary },
  catCircleWrap: { alignItems: 'center', width: 76 },
  catCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  catCircleImg: { width: '100%', height: '100%' },
  catInitial: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.primary },
  catCircleName: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.text, marginTop: 6, textAlign: 'center' },
  banner: { margin: spacing.lg, marginTop: spacing.xxl, height: 200, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,28,28,0.35)' },
  bannerContent: { padding: spacing.xl },
  bannerLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.white, letterSpacing: 2 },
  bannerTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.white, marginTop: 4 },
  bannerBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radii.full, paddingHorizontal: 18, paddingVertical: 9 },
  bannerBtnText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.text },
  colCard: { width: 220, height: 130, borderRadius: radii.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  colImg: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.surface },
  colOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  colName: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.white, padding: spacing.md },
  recentImg: { width: '100%', aspectRatio: 3 / 4, borderRadius: radii.md, backgroundColor: colors.surface },
  recentName: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.text, marginTop: 6 },
  recentPrice: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 2 },
  journal: { margin: spacing.lg, marginTop: spacing.xxl, height: 120, borderRadius: radii.lg, backgroundColor: colors.secondary, padding: spacing.lg, justifyContent: 'center' },
  journalLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.white, letterSpacing: 2 },
  journalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.white, marginTop: 4 },
  journalArrow: { position: 'absolute', right: spacing.lg, top: '50%', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
});
