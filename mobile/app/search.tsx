import { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/Screen';
import ProductCard from '../src/components/ProductCard';
import EmptyState from '../src/components/EmptyState';
import { useProducts } from '../src/api/catalog';
import { colors, fonts, radii, spacing } from '../src/theme';

export default function SearchScreen() {
  const params = useLocalSearchParams<{
    search?: string; category?: string; productType?: string;
    isNewArrival?: string; isBestSeller?: string; isTrending?: string;
  }>();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState(params.search ?? '');

  const { data, isLoading } = useProducts({
    search: q || undefined,
    category: params.category,
    productType: params.productType,
    isNewArrival: params.isNewArrival === 'true' || undefined,
    isBestSeller: params.isBestSeller === 'true' || undefined,
    isTrending: params.isTrending === 'true' || undefined,
    limit: 24,
  });
  const products = data?.data ?? [];
  const col = (width - spacing.lg * 3) / 2;

  return (
    <Screen edges={false}>
      <Stack.Screen options={{ headerShown: true, title: 'Search', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search sarees, kurtis, jewellery…"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoFocus={!params.category && !params.productType}
          returnKeyType="search"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <EmptyState icon="search-outline" title="No results" subtitle="Try a different search or filter." />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(p) => p._id}
          columnWrapperStyle={{ gap: spacing.lg, paddingHorizontal: spacing.lg }}
          contentContainerStyle={{ paddingVertical: spacing.md, paddingBottom: 32 }}
          renderItem={({ item }) => <ProductCard product={item} width={col} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: spacing.lg, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, backgroundColor: colors.white },
  input: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text },
});
