import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import EmptyState from '../../src/components/EmptyState';
import { useAuth } from '../../src/store/auth';
import { colors, fonts, radii, spacing, shadow } from '../../src/theme';

const ROWS: { icon: keyof typeof Ionicons.glyphMap; label: string; href: string }[] = [
  { icon: 'cube-outline', label: 'My Orders', href: '/orders' },
  { icon: 'location-outline', label: 'Addresses', href: '/addresses' },
  { icon: 'heart-outline', label: 'Wishlist', href: '/(tabs)/wishlist' },
  { icon: 'notifications-outline', label: 'Notifications', href: '/notifications' },
  { icon: 'help-circle-outline', label: 'Support', href: '/support' },
  { icon: 'settings-outline', label: 'Settings', href: '/settings' },
];

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Screen>
        <Text style={styles.header}>Profile</Text>
        <EmptyState
          icon="person-outline"
          title="Sign in to your account"
          subtitle="Access orders, wishlist, addresses and more."
          ctaText="Sign In"
          onCta={() => router.push('/(auth)/login')}
        />
      </Screen>
    );
  }

  const onLogout = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Brand header with avatar */}
        <View style={styles.hero}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text></View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Menu card overlapping header */}
        <View style={[styles.menu, shadow.card]}>
          {ROWS.map((r, i) => (
            <Pressable key={r.label} style={[styles.row, i === ROWS.length - 1 && { borderBottomWidth: 0 }]} onPress={() => router.push(r.href as never)}>
              <View style={styles.rowIcon}><Ionicons name={r.icon} size={18} color={colors.primary} /></View>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} style={{ marginLeft: 'auto' }} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.logout} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, padding: spacing.lg },
  hero: { paddingTop: 70, paddingBottom: 56, alignItems: 'center', backgroundColor: colors.primary },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.headingBold, fontSize: 30, color: colors.white },
  name: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.white, marginTop: 12 },
  email: { fontFamily: fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  menu: { marginTop: -32, marginHorizontal: spacing.lg, backgroundColor: colors.white, borderRadius: radii.xxl, paddingHorizontal: spacing.sm, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.xl, marginHorizontal: spacing.lg, paddingVertical: 15, borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, backgroundColor: colors.white },
  logoutText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.danger },
});
