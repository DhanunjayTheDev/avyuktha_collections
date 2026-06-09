import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../src/components/Screen';
import EmptyState from '../../src/components/EmptyState';
import { useAuth } from '../../src/store/auth';
import { colors, fonts, radii, spacing } from '../../src/theme';

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
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.header}>Profile</Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text></View>
          <View>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.rows}>
          {ROWS.map((r) => (
            <Pressable key={r.label} style={styles.row} onPress={() => router.push(r.href as never)}>
              <Ionicons name={r.icon} size={20} color={colors.text} />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, padding: spacing.lg },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: spacing.lg, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radii.lg },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.white },
  name: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  email: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  rows: { marginTop: spacing.xl, marginHorizontal: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.xxl, marginHorizontal: spacing.lg, paddingVertical: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radii.full },
  logoutText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.danger },
});
