import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../src/theme';
import { useCart, cartTotals } from '../../src/api/cart';
import { useWishlist } from '../../src/api/wishlist';

export default function TabsLayout() {
  const { data: cart } = useCart();
  const { count: cartCount } = cartTotals(cart);
  const { data: wishlist } = useWishlist();
  const wishCount = wishlist?.length ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 10 },
        tabBarBadgeStyle: { backgroundColor: colors.primary, fontSize: 10, fontFamily: fonts.bodySemibold },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="categories" options={{ title: 'Categories', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="wishlist" options={{ title: 'Wishlist', tabBarBadge: wishCount > 0 ? wishCount : undefined, tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarBadge: cartCount > 0 ? cartCount : undefined, tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
