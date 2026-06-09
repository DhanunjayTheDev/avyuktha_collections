import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/Screen';
import EmptyState from '../src/components/EmptyState';
import { useAnnouncements } from '../src/api/content';
import { colors, fonts, radii, spacing } from '../src/theme';

export default function Notifications() {
  const { data, isLoading } = useAnnouncements();
  const items = data ?? [];

  return (
    <Screen edges={false}>
      <Stack.Screen options={{ headerShown: true, title: 'Notifications', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <EmptyState icon="notifications-outline" title="No notifications" subtitle="Offers and updates will appear here." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(a) => a._id}
          contentContainerStyle={{ padding: spacing.lg, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.icon}><Ionicons name="megaphone-outline" size={18} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.content}</Text>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.white },
  icon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  body: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 18 },
});
