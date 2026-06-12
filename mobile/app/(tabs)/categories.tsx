import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import { useCategories, useProductTypes } from '../../src/api/catalog';
import { categoryImage } from '../../src/lib/categoryImage';
import { colors, fonts, radii, spacing, shadow } from '../../src/theme';
import type { Category, ProductType } from '../../src/types';

export default function Categories() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data, isLoading } = useCategories();
  const { data: types } = useProductTypes();
  const [activeType, setActiveType] = useState<string | null>(null);

  const all = data ?? [];
  const categories = activeType ? all.filter((c) => c.productType === activeType) : all;
  const col = (width - spacing.lg * 2 - spacing.md) / 2;

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.kicker}>BROWSE</Text>
        <Text style={styles.title}>Categories</Text>
      </View>

      {/* Product-type tabs (underline) */}
      {!!types?.length && (
        <View style={styles.tabsBar}>
          <FlatList
            data={[{ _id: 'all', name: 'All', slug: '' } as ProductType, ...types]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(t) => t._id}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 26 }}
            renderItem={({ item }) => {
              const active = (item.slug || null) === activeType;
              return (
                <Pressable style={styles.tab} onPress={() => setActiveType(item.slug || null)}>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.name}</Text>
                  <View style={[styles.tabBar, active && styles.tabBarActive]} />
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={categories}
          numColumns={2}
          keyExtractor={(c) => c._id}
          columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
          contentContainerStyle={{ gap: spacing.md, paddingBottom: 32 }}
          renderItem={({ item, index }: { item: Category; index: number }) => (
            <Pressable
              style={[styles.card, { width: col }, shadow.soft]}
              onPress={() => router.push(`/search?category=${item.slug}`)}
            >
              <Image source={{ uri: item.image || categoryImage(item.name, index) }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
              <View style={styles.scrim} />
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <View style={styles.cardCta}>
                  <Text style={styles.cardCtaText}>Explore</Text>
                  <Ionicons name="arrow-forward" size={13} color={colors.text} />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  kicker: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.primary, letterSpacing: 3 },
  title: { fontFamily: fonts.headingBold, fontSize: 32, color: colors.text, marginTop: 2 },
  // tabs (underline)
  tabsBar: { borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.lg },
  tab: { alignItems: 'center' },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.muted, paddingVertical: 12, letterSpacing: 0.3 },
  tabTextActive: { fontFamily: fonts.bodySemibold, color: colors.text },
  tabBar: { height: 2.5, width: '100%', borderRadius: 2, backgroundColor: 'transparent' },
  tabBarActive: { backgroundColor: colors.primary },
  // cards
  card: { aspectRatio: 0.8, borderRadius: radii.xl, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.surface },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,28,28,0.32)' },
  cardBody: { padding: spacing.md },
  cardName: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.white, lineHeight: 21 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radii.full, paddingHorizontal: 11, paddingVertical: 6 },
  cardCtaText: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.text },
});
