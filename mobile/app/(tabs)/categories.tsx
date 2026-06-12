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

      {/* Product-type filter pills */}
      {!!types?.length && (
        <FlatList
          data={[{ _id: 'all', name: 'All', slug: '' } as ProductType, ...types]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(t) => t._id}
          style={styles.pillsRow}
          contentContainerStyle={styles.pillsContent}
          renderItem={({ item }) => {
            const active = (item.slug || null) === activeType;
            return (
              <Pressable
                onPress={() => setActiveType(item.slug || null)}
                style={[styles.pill, active ? styles.pillActive : styles.pillInactive, active && shadow.soft]}
              >
                <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
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
  // pills
  pillsRow: { flexGrow: 0, marginBottom: spacing.lg },
  pillsContent: { paddingHorizontal: spacing.lg, gap: 10, alignItems: 'center' },
  pill: { height: 40, paddingHorizontal: 20, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.primary },
  pillInactive: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  pillText: { fontSize: 13, letterSpacing: 0.3, includeFontPadding: false },
  pillTextActive: { fontFamily: fonts.bodySemibold, color: colors.white },
  pillTextInactive: { fontFamily: fonts.bodyMedium, color: colors.muted },
  // cards
  card: { aspectRatio: 0.8, borderRadius: radii.xl, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.surface },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,28,28,0.32)' },
  cardBody: { padding: spacing.md },
  cardName: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.white, lineHeight: 21 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: radii.full, paddingHorizontal: 11, paddingVertical: 6 },
  cardCtaText: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.text },
});
