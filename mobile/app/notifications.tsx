import { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/Screen';
import EmptyState from '../src/components/EmptyState';
import { useNotifications, useMarkRead, useMarkAllRead, type AppNotification } from '../src/api/notifications';
import { colors, fonts, radii, spacing } from '../src/theme';
import { formatDate } from '../src/utils/format';

const TYPE_ICON: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  order_confirmed:       { name: 'checkmark-circle',  color: '#10B981' },
  order_cancelled:       { name: 'close-circle',       color: '#EF4444' },
  order_shipped:         { name: 'bicycle',             color: '#6366F1' },
  order_delivered:       { name: 'gift',                color: '#F59E0B' },
  order_status_changed:  { name: 'refresh-circle',     color: '#6366F1' },
  general:               { name: 'megaphone',           color: colors.primary },
};

function NotifCard({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const icon = TYPE_ICON[item.type] ?? TYPE_ICON.general;
  return (
    <Pressable
      style={[styles.card, !item.isRead && styles.cardUnread]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: icon.color + '1A' }]}>
        <Ionicons name={icon.name} size={20} color={icon.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTop}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          {!item.isRead && <View style={styles.dot} />}
        </View>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handlePress = useCallback(
    (item: AppNotification) => {
      if (!item.isRead) markRead.mutate(item._id);
      if (item.orderId) router.push(`/order/${item.orderId}` as never);
    },
    [markRead, router]
  );

  return (
    <Screen edges={false}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Notifications',
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.bg },
          headerRight: () =>
            unreadCount > 0 ? (
              <Pressable
                style={{ paddingRight: 16 }}
                onPress={() => markAllRead.mutate()}
              >
                <Text style={styles.markAll}>Mark all read</Text>
              </Pressable>
            ) : null,
        }}
      />

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No notifications"
          subtitle="Order updates and offers will appear here."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n._id}
          contentContainerStyle={{ padding: spacing.lg, gap: 10 }}
          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }) => (
            <NotifCard item={item} onPress={() => handlePress(item)} />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.white,
  },
  cardUnread: {
    backgroundColor: '#F5F3FF',
    borderColor: '#C4B5FD',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  title: {
    flex: 1,
    fontFamily: fonts.bodySemibold,
    fontSize: 13,
    color: colors.text,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  markAll: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.primary,
  },
});
