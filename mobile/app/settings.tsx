import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/Screen';
import { useAuth } from '../src/store/auth';
import { colors, fonts, radii, spacing } from '../src/theme';

export default function Settings() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  const rows: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/notifications') },
    { icon: 'headset-outline', label: 'Help & Support', onPress: () => router.push('/support') },
    { icon: 'document-text-outline', label: 'Privacy Policy', onPress: () => Linking.openURL('https://avyukthafashions.com/privacy') },
    { icon: 'shield-checkmark-outline', label: 'Terms of Service', onPress: () => Linking.openURL('https://avyukthafashions.com/terms') },
  ];

  const onLogout = () => {
    Alert.alert('Sign out?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen edges={false}>
      <Stack.Screen options={{ headerShown: true, title: 'Settings', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.group}>
          {rows.map((r) => (
            <Pressable key={r.label} style={styles.row} onPress={r.onPress}>
              <Ionicons name={r.icon} size={20} color={colors.text} />
              <Text style={styles.label}>{r.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} style={{ marginLeft: 'auto' }} />
            </Pressable>
          ))}
        </View>

        {isAuthenticated && (
          <Pressable style={styles.logout} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        )}

        <Text style={styles.version}>Avyuktha Fashions v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.white, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.xl, paddingVertical: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radii.full },
  logoutText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.danger },
  version: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: spacing.xxl },
});
