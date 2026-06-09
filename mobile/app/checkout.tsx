import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Screen from '../src/components/Screen';
import Field from '../src/components/Field';
import { useCart, cartTotals } from '../src/api/cart';
import { useAddresses, useManageAddress } from '../src/api/account';
import { useCreateOrder } from '../src/api/orders';
import { colors, fonts, radii, spacing } from '../src/theme';
import { formatPrice } from '../src/utils/format';
import type { Address } from '../src/types';

const addrSchema = z.object({
  label: z.string().min(1, 'Required'),
  fullName: z.string().min(2, 'Required'),
  phone: z.string().min(10, 'Invalid').max(15),
  line1: z.string().min(3, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  pincode: z.string().min(5, 'Invalid'),
});
type AddrForm = z.infer<typeof addrSchema>;

const PAYMENTS = [
  { key: 'cod', label: 'Cash on Delivery', enabled: true },
  { key: 'razorpay', label: 'Card / UPI / Netbanking (Razorpay)', enabled: false },
];

export default function Checkout() {
  const router = useRouter();
  const { data: cart } = useCart();
  const { data: addresses, isLoading: addrLoading } = useAddresses();
  const { addAddress } = useManageAddress();
  const createOrder = useCreateOrder();

  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [payment, setPayment] = useState('cod');

  const { subtotal } = cartTotals(cart);
  const shipping = subtotal > 0 && subtotal < 999 ? 99 : 0;
  const total = subtotal + shipping;

  const addressId = selected ?? addresses?.find((a: Address) => a.isDefault)?._id ?? addresses?.[0]?._id ?? null;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddrForm>({
    resolver: zodResolver(addrSchema),
    defaultValues: { label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' },
  });

  const saveAddress = async (values: AddrForm) => {
    try {
      await addAddress.mutateAsync({ ...values, country: 'India' } as Address);
      reset();
      setShowForm(false);
    } catch {
      Alert.alert('Error', 'Could not save address.');
    }
  };

  const placeOrder = async () => {
    if (!addressId) { Alert.alert('Address needed', 'Add a delivery address first.'); return; }
    try {
      const order = await createOrder.mutateAsync({ addressId, paymentMethod: payment, couponCode: coupon.trim() || undefined });
      router.replace(`/order/${order._id}`);
    } catch {
      Alert.alert('Order failed', 'Something went wrong placing your order.');
    }
  };

  return (
    <Screen edges={false}>
      <Stack.Screen options={{ headerShown: true, title: 'Checkout', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.bg } }} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        {/* Address */}
        <Text style={styles.section}>Delivery Address</Text>
        {addrLoading ? <ActivityIndicator color={colors.primary} /> : (
          <>
            {addresses?.map((a: Address) => {
              const active = addressId === a._id;
              return (
                <Pressable key={a._id} style={[styles.addr, active && styles.addrActive]} onPress={() => setSelected(a._id!)}>
                  <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={18} color={active ? colors.primary : colors.muted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addrName}>{a.fullName} · {a.label}</Text>
                    <Text style={styles.addrText}>{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}</Text>
                    <Text style={styles.addrText}>{a.phone}</Text>
                  </View>
                </Pressable>
              );
            })}
            {!showForm && (
              <Pressable style={styles.addNew} onPress={() => setShowForm(true)}>
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={styles.addNewText}>Add new address</Text>
              </Pressable>
            )}
          </>
        )}

        {showForm && (
          <View style={styles.form}>
            {([['label', 'Label (Home/Work)'], ['fullName', 'Full name'], ['phone', 'Phone'], ['line1', 'Address line 1'], ['line2', 'Address line 2 (optional)'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']] as const).map(([name, label]) => (
              <Controller key={name} control={control} name={name} render={({ field }) => (
                <Field label={label} value={field.value} onChangeText={field.onChange}
                  keyboardType={name === 'phone' || name === 'pincode' ? 'number-pad' : 'default'}
                  error={errors[name]?.message} />
              )} />
            ))}
            <Pressable style={styles.saveBtn} onPress={handleSubmit(saveAddress)} disabled={addAddress.isPending}>
              <Text style={styles.saveText}>{addAddress.isPending ? 'Saving…' : 'Save Address'}</Text>
            </Pressable>
          </View>
        )}

        {/* Coupon */}
        <Text style={styles.section}>Coupon</Text>
        <Field label="" value={coupon} onChangeText={setCoupon} placeholder="Enter coupon code" autoCapitalize="characters" />

        {/* Payment */}
        <Text style={styles.section}>Payment Method</Text>
        {PAYMENTS.map((p) => (
          <Pressable key={p.key} disabled={!p.enabled} style={[styles.pay, !p.enabled && { opacity: 0.45 }]} onPress={() => setPayment(p.key)}>
            <Ionicons name={payment === p.key ? 'radio-button-on' : 'radio-button-off'} size={18} color={payment === p.key ? colors.primary : colors.muted} />
            <Text style={styles.payLabel}>{p.label}</Text>
            {!p.enabled && <Text style={styles.soon}>Soon</Text>}
          </Pressable>
        ))}

        {/* Summary */}
        <Text style={styles.section}>Order Summary</Text>
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumVal}>{formatPrice(subtotal)}</Text></View>
        <View style={styles.sumRow}><Text style={styles.sumLabel}>Shipping</Text><Text style={styles.sumVal}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</Text></View>
        <View style={[styles.sumRow, { marginTop: 6 }]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalVal}>{formatPrice(total)}</Text></View>
        <Text style={styles.note}>Coupon discount (if any) is applied on the next step.</Text>
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable style={[styles.place, createOrder.isPending && { opacity: 0.6 }]} disabled={createOrder.isPending} onPress={placeOrder}>
          <Text style={styles.placeText}>{createOrder.isPending ? 'Placing…' : `Place Order · ${formatPrice(total)}`}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  addr: { flexDirection: 'row', gap: 10, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, marginBottom: 8, alignItems: 'flex-start' },
  addrActive: { borderColor: colors.primary, backgroundColor: '#FBF7F1' },
  addrName: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  addrText: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 },
  addNew: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  addNewText: { fontFamily: fonts.bodyMedium, color: colors.primary, fontSize: 14 },
  form: { marginTop: 8 },
  saveBtn: { backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  saveText: { fontFamily: fonts.bodySemibold, color: colors.white },
  pay: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, marginBottom: 8 },
  payLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, flex: 1 },
  soon: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sumLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  sumVal: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  totalLabel: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  totalVal: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text },
  note: { fontFamily: fonts.body, fontSize: 11, color: colors.muted, marginTop: 8 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  place: { backgroundColor: colors.text, borderRadius: radii.full, paddingVertical: 16, alignItems: 'center' },
  placeText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.white },
});
