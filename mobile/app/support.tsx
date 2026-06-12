import { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../src/components/Screen';
import Field from '../src/components/Field';
import EmptyState from '../src/components/EmptyState';
import { useAuth } from '../src/store/auth';
import { useTickets, useCreateTicket } from '../src/api/content';
import { colors, fonts, radii, spacing } from '../src/theme';

const STATUS_COLOR: Record<string, string> = {
  open: '#1E40AF', pending: '#854D0E', resolved: '#166534', closed: '#6B7280',
};

export default function Support() {
  const router = useRouter();
  const isAuth = useAuth((s) => s.isAuthenticated);
  const { data: tickets, isLoading } = useTickets();
  const createTicket = useCreateTicket();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');

  if (!isAuth) {
    return (
      <Screen edges={false}>
        <Stack.Screen options={{ headerShown: true, title: 'Support', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />
        <EmptyState icon="headset-outline" title="Sign in for support" ctaText="Sign In" onCta={() => router.push('/(auth)/login')} />
      </Screen>
    );
  }

  const submit = async () => {
    if (subject.trim().length < 3 || description.trim().length < 5) { Alert.alert('Missing info', 'Add a subject and description.'); return; }
    try {
      await createTicket.mutateAsync({ subject: subject.trim(), category, description: description.trim() });
      setSubject(''); setDescription(''); setOpen(false);
    } catch { Alert.alert('Error', 'Could not create ticket.'); }
  };

  return (
    <Screen edges={false}>
      <Stack.Screen options={{ headerShown: true, title: 'Support', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />

      {open ? (
        <View style={{ padding: spacing.lg }}>
          <Field label="Subject" value={subject} onChangeText={setSubject} placeholder="Order issue, return…" />
          <Field label="Category" value={category} onChangeText={setCategory} placeholder="General / Order / Payment" />
          <Field label="Description" value={description} onChangeText={setDescription} placeholder="Describe your issue…" multiline numberOfLines={4} style={{ height: 110, textAlignVertical: 'top' }} />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <Pressable style={styles.cancel} onPress={() => setOpen(false)}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            <Pressable style={styles.submit} onPress={submit} disabled={createTicket.isPending}>
              <Text style={styles.submitText}>{createTicket.isPending ? 'Sending…' : 'Submit'}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <Pressable style={styles.newBtn} onPress={() => setOpen(true)}>
            <Ionicons name="add" size={18} color={colors.white} />
            <Text style={styles.newText}>New Ticket</Text>
          </Pressable>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : !tickets?.length ? (
            <EmptyState icon="chatbubbles-outline" title="No tickets" subtitle="Raise a ticket and we’ll help you out." />
          ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.recentHead}>
                <Text style={styles.recentTitle}>Recent Tickets</Text>
                {tickets.length > 3 && (
                  <Pressable onPress={() => router.push('/tickets')}><Text style={styles.viewAll}>View all ({tickets.length})</Text></Pressable>
                )}
              </View>
              <FlatList
                data={tickets.slice(0, 3)}
                keyExtractor={(t) => t._id}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 12, paddingBottom: spacing.lg }}
                renderItem={({ item }) => (
                  <Pressable style={styles.card} onPress={() => router.push(`/support/${item._id}`)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
                      <Text style={styles.meta}>{item.category} · {new Date(item.createdAt).toLocaleDateString('en-IN')}</Text>
                    </View>
                    <Text style={[styles.status, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
                  </Pressable>
                )}
              />
              <Pressable style={styles.allBtn} onPress={() => router.push('/tickets')}>
                <Ionicons name="albums-outline" size={16} color={colors.text} />
                <Text style={styles.allBtnText}>See all tickets</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  newBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 13, margin: spacing.lg },
  newText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.white },
  subject: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  status: { fontFamily: fonts.bodySemibold, fontSize: 11, textTransform: 'capitalize' },
  recentHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  recentTitle: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  viewAll: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.primary },
  allBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, paddingVertical: 13, marginHorizontal: spacing.lg, marginTop: 'auto', marginBottom: spacing.lg },
  allBtnText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  cancel: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontFamily: fonts.bodySemibold, color: colors.text },
  submit: { flex: 1, backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 14, alignItems: 'center' },
  submitText: { fontFamily: fonts.bodySemibold, color: colors.white },
});
