import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_DEFAULT, type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDelivery } from '../src/store/delivery';
import { colors, fonts, radii, spacing } from '../src/theme';

const DEFAULT_REGION: Region = { latitude: 17.385, longitude: 78.4867, latitudeDelta: 0.008, longitudeDelta: 0.008 };

export default function LocationMap() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const setCurrentLabel = useDelivery((s) => s.setCurrentLabel);
  const setDraft = useDelivery((s) => s.setDraft);
  const mapRef = useRef<MapView>(null);
  const details = useRef<{ line1: string; city: string; state: string; pincode: string }>({ line1: '', city: '', state: '', pincode: '' });

  const [region, setRegion] = useState<Region>(
    params.lat && params.lng
      ? { latitude: Number(params.lat), longitude: Number(params.lng), latitudeDelta: 0.008, longitudeDelta: 0.008 }
      : DEFAULT_REGION
  );
  const [label, setLabel] = useState('Fetching address…');
  const [locating, setLocating] = useState(false);
  const [q, setQ] = useState('');

  const reverse = async (lat: number, lng: number) => {
    try {
      const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const g = geo[0];
      if (g) {
        const txt = [g.name || g.street, g.district || g.subregion, g.city, g.region].filter(Boolean).join(', ');
        setLabel(txt || 'Selected location');
        details.current = {
          line1: [g.name, g.street].filter(Boolean).join(', ') || g.district || '',
          city: g.city || g.subregion || '',
          state: g.region || '',
          pincode: g.postalCode || '',
        };
      }
    } catch { setLabel('Selected location'); }
  };

  // On mount: if no coords passed, jump to current location.
  useEffect(() => {
    if (params.lat && params.lng) { void reverse(Number(params.lat), Number(params.lng)); return; }
    void locateMe();
  }, []);

  const locateMe = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const r: Region = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 };
        setRegion(r);
        mapRef.current?.animateToRegion(r, 600);
        void reverse(r.latitude, r.longitude);
      }
    } catch { /* ignore */ } finally { setLocating(false); }
  };

  const search = async () => {
    if (!q.trim()) return;
    try {
      const res = await Location.geocodeAsync(q.trim());
      const g = res[0];
      if (g) {
        const r: Region = { latitude: g.latitude, longitude: g.longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 };
        setRegion(r);
        mapRef.current?.animateToRegion(r, 600);
        void reverse(r.latitude, r.longitude);
      }
    } catch { /* ignore */ }
  };

  const confirm = () => {
    setCurrentLabel(label);
    // Stash a geocoded draft so checkout can prefill a new-address form.
    setDraft({ ...details.current, lat: region.latitude, lng: region.longitude });
    router.navigate('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onRegionChangeComplete={(r) => { setRegion(r); void reverse(r.latitude, r.longitude); }}
        showsMyLocationButton={false}
      />

      {/* Center fixed pin + tooltip */}
      <View pointerEvents="none" style={styles.pinWrap}>
        <View style={styles.tooltip}><Text style={styles.tooltipText}>Order will be delivered here, Move the pin to change location</Text></View>
        <Ionicons name="location" size={42} color={colors.primary} />
      </View>

      {/* Top search */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search for building, street or area"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={search}
          />
        </View>
      </View>

      {/* Use my current location */}
      <Pressable style={styles.gpsBtn} onPress={locateMe}>
        {locating ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="locate" size={18} color={colors.primary} />}
        <Text style={styles.gpsText}>Use my current Location</Text>
      </Pressable>

      {/* Bottom card */}
      <View style={[styles.card, { paddingBottom: (insets.bottom || 12) + 12 }]}>
        <Text style={styles.cardTitle}>Deliver To</Text>
        <View style={styles.addrBox}>
          <View style={styles.addrRow}>
            <Ionicons name="location" size={18} color={colors.text} />
            <Text style={styles.addrText} numberOfLines={2}>{label}</Text>
          </View>
          <Pressable style={styles.confirm} onPress={confirm}>
            <Text style={styles.confirmText}>Confirm & Proceed</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pinWrap: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  tooltip: { backgroundColor: '#16121F', borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 10, maxWidth: 280, marginBottom: 6 },
  tooltipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.white, textAlign: 'center', lineHeight: 18 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingBottom: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderRadius: radii.full, paddingHorizontal: 16, height: 48, elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text },
  gpsBtn: { position: 'absolute', bottom: 210, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.white, borderRadius: radii.full, paddingHorizontal: 18, paddingVertical: 12, elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  gpsText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.primary },
  card: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, padding: spacing.lg },
  cardTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text, marginBottom: spacing.md },
  addrBox: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: '#F6F4FB', padding: 16 },
  addrRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  addrText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, lineHeight: 20 },
  confirm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 14 },
  confirmText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.primary },
});
