import { useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Screen from '../src/components/Screen';
import Field from '../src/components/Field';
import EmptyState from '../src/components/EmptyState';
import { useAddresses, useManageAddress } from '../src/api/account';
import { colors, fonts, radii, spacing } from '../src/theme';
import type { Address } from '../src/types';

const schema = z.object({
  label: z.string().min(1), fullName: z.string().min(2), phone: z.string().min(10).max(15),
  line1: z.string().min(3), line2: z.string().optional(), city: z.string().min(2),
  state: z.string().min(2), pincode: z.string().min(5),
});
type AddrForm = z.infer<typeof schema>;

export default function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  const { addAddress, deleteAddress } = useManageAddress();
  const [open, setOpen] = useState(false);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddrForm>({
    resolver: zodResolver(schema),
    defaultValues: { label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' },
  });

  const save = async (v: AddrForm) => {
    try { await addAddress.mutateAsync({ ...v, country: 'India' } as Address); reset(); setOpen(false); }
    catch { Alert.alert('Error', 'Could not save address.'); }
  };

  return (
    <Screen edges={false}>
      <Stack.Screen options={{ headerShown: true, title: 'Addresses', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />
      {open ? (
        <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
          {([['label', 'Label'], ['fullName', 'Full name'], ['phone', 'Phone'], ['line1', 'Address line 1'], ['line2', 'Address line 2 (optional)'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']] as const).map(([name, label]) => (
            <Controller key={name} control={control} name={name} render={({ field }) => (
              <Field label={label} value={field.value} onChangeText={field.onChange}
                keyboardType={name === 'phone' || name === 'pincode' ? 'number-pad' : 'default'} error={errors[name]?.message} />
            )} />
          ))}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable style={styles.cancel} onPress={() => setOpen(false)}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            <Pressable style={styles.save} onPress={handleSubmit(save)} disabled={addAddress.isPending}>
              <Text style={styles.saveText}>{addAddress.isPending ? 'Saving…' : 'Save'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <>
          <Pressable style={styles.newBtn} onPress={() => setOpen(true)}>
            <Ionicons name="add" size={18} color={colors.white} /><Text style={styles.newText}>Add Address</Text>
          </Pressable>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : !addresses?.length ? (
            <EmptyState icon="location-outline" title="No saved addresses" />
          ) : (
            <FlatList
              data={addresses}
              keyExtractor={(a) => a._id!}
              contentContainerStyle={{ padding: spacing.lg, gap: 12 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.fullName} · {item.label}</Text>
                    <Text style={styles.text}>{item.line1}{item.line2 ? `, ${item.line2}` : ''}, {item.city}, {item.state} {item.pincode}</Text>
                    <Text style={styles.text}>{item.phone}</Text>
                  </View>
                  <Pressable onPress={() => deleteAddress.mutate(item._id!)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              )}
            />
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  newBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 13, margin: spacing.lg },
  newText: { fontFamily: fonts.bodySemibold, color: colors.white, fontSize: 14 },
  card: { flexDirection: 'row', gap: 10, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.white, alignItems: 'flex-start' },
  name: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  text: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  cancel: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radii.full, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontFamily: fonts.bodySemibold, color: colors.text },
  save: { flex: 1, backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 14, alignItems: 'center' },
  saveText: { fontFamily: fonts.bodySemibold, color: colors.white },
});
