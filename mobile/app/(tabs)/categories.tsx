import { View, Text, FlatList, Pressable, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import { useCategories, useProductTypes } from '../../src/api/catalog';
import { colors, fonts, radii, spacing, gradients, shadow } from '../../src/theme';
import type { Category, ProductType } from '../../src/types';

export default function Categories() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data, isLoading } = useCategories();
  const { data: types } = useProductTypes();
  const categories = data ?? [];
  const col = (width - spacing.lg * 2 - spacing.md) / 2;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>Explore the edit</Text>
      </View>

      {!!types?.length && (
        <FlatList
          data={types}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(t) => t._id}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 10, paddingBottom: spacing.lg }}
          renderItem={({ item }: { item: ProductType }) => (
            <Pressable style={styles.typeChip} onPress={() => router.push(`/search?productType=${item.slug}`)}>
              <Text style={styles.typeChipText}>{item.name}</Text>
            </Pressable>
          )}
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
          renderItem={({ item, index }: { item: Category; index: number }) => {
            const g = gradients[index % gradients.length];
            return (
              <Pressable style={[styles.card, { width: col }, shadow.card]} onPress={() => router.push(`/search?category=${item.slug}`)}>
                {item.image ? (
                  <>
                    <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" />
                    <LinearGradient colors={['transparent', 'rgba(28,28,28,0.55)']} style={StyleSheet.absoluteFill} />
                  </>
                ) : (
                  <LinearGradient colors={g} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <View style={styles.cardArrow}><Ionicons name="arrow-forward" size={14} color={colors.text} /></View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { fontFamily: fonts.headingBold, fontSize: 30, color: colors.text },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  typeChip: { borderWidth: 1, borderColor: colors.text, borderRadius: radii.full, paddingHorizontal: 18, paddingVertical: 9 },
  typeChipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
  card: { aspectRatio: 0.82, borderRadius: radii.xl, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.surface },
  cardBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  cardName: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.white, flex: 1, textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 4 },
  cardArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
