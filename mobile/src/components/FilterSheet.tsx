import { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAttributes } from '../api/catalog';
import { colors, fonts, radii, spacing } from '../theme';
import type { Attribute } from '../types';

export interface FilterState {
  price: string | null; // PRICE_RANGES key
  attrs: Record<string, string[]>; // attribute slug -> selected values
}

export const PRICE_RANGES = [
  { key: '0-500', label: 'Under ₹500', min: 0, max: 500 },
  { key: '500-1000', label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { key: '1000-2000', label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { key: '2000-5000', label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { key: '5000-', label: 'Above ₹5,000', min: 5000, max: undefined as number | undefined },
];

export const emptyFilters: FilterState = { price: null, attrs: {} };

export const activeFilterCount = (f: FilterState): number =>
  (f.price ? 1 : 0) + Object.values(f.attrs).reduce((s, v) => s + v.length, 0);

/** Convert filter state into product query params. */
export const filtersToQuery = (f: FilterState): Record<string, string | number> => {
  const q: Record<string, string | number> = {};
  if (f.price) {
    const r = PRICE_RANGES.find((p) => p.key === f.price);
    if (r) { q.minPrice = r.min; if (r.max != null) q.maxPrice = r.max; }
  }
  for (const [slug, vals] of Object.entries(f.attrs)) {
    if (vals.length) q[slug] = vals.join(',');
  }
  return q;
};

export default function FilterSheet({
  visible, productType, value, onApply, onClose,
}: {
  visible: boolean;
  productType?: string;
  value: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}) {
  const { data: attributes } = useAttributes(productType);
  const [local, setLocal] = useState<FilterState>(value);
  const [group, setGroup] = useState(0);

  useEffect(() => { if (visible) { setLocal(value); setGroup(0); } }, [visible]);

  // Groups: Price first, then each filterable attribute.
  const groups = useMemo(() => ['Price', ...(attributes ?? []).map((a) => a.name)], [attributes]);
  const activeAttr: Attribute | undefined = group > 0 ? attributes?.[group - 1] : undefined;

  const togglePrice = (key: string) =>
    setLocal((p) => ({ ...p, price: p.price === key ? null : key }));

  const toggleAttr = (slug: string, val: string) =>
    setLocal((p) => {
      const cur = p.attrs[slug] ?? [];
      const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
      return { ...p, attrs: { ...p.attrs, [slug]: next } };
    });

  const groupCount = (i: number): number => {
    if (i === 0) return local.price ? 1 : 0;
    const a = attributes?.[i - 1];
    return a ? (local.attrs[a.slug]?.length ?? 0) : 0;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.title}>Filters</Text>
            <Pressable onPress={() => setLocal(emptyFilters)}>
              <Text style={styles.clear}>CLEAR ALL</Text>
            </Pressable>
          </View>

          <View style={styles.panes}>
            {/* Left rail */}
            <ScrollView style={styles.rail} contentContainerStyle={{ paddingBottom: 20 }}>
              {groups.map((g, i) => {
                const active = i === group;
                const n = groupCount(i);
                return (
                  <Pressable key={g} style={[styles.railItem, active && styles.railItemActive]} onPress={() => setGroup(i)}>
                    <Text style={[styles.railText, active && styles.railTextActive]} numberOfLines={1}>{g}</Text>
                    {n > 0 && <Text style={styles.railCount}>{n}</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Right options */}
            <ScrollView style={styles.options} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 30 }}>
              {group === 0 ? (
                PRICE_RANGES.map((r) => {
                  const sel = local.price === r.key;
                  return (
                    <Pressable key={r.key} style={styles.optRow} onPress={() => togglePrice(r.key)}>
                      <Ionicons name={sel ? 'radio-button-on' : 'radio-button-off'} size={20} color={sel ? colors.primary : colors.muted} />
                      <Text style={[styles.optText, sel && styles.optTextSel]}>{r.label}</Text>
                    </Pressable>
                  );
                })
              ) : activeAttr?.inputType === 'color' ? (
                <View style={styles.swatchWrap}>
                  {activeAttr.options.map((o) => {
                    const sel = local.attrs[activeAttr.slug]?.includes(o.value);
                    return (
                      <Pressable key={o.value} style={styles.swatchItem} onPress={() => toggleAttr(activeAttr.slug, o.value)}>
                        <View style={[styles.swatch, { backgroundColor: o.hex || colors.surface }, sel && styles.swatchSel]}>
                          {sel && <Ionicons name="checkmark" size={16} color={colors.white} />}
                        </View>
                        <Text style={styles.swatchText} numberOfLines={1}>{o.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                activeAttr?.options.map((o) => {
                  const sel = local.attrs[activeAttr.slug]?.includes(o.value);
                  return (
                    <Pressable key={o.value} style={styles.optRow} onPress={() => toggleAttr(activeAttr.slug, o.value)}>
                      <Ionicons name={sel ? 'checkbox' : 'square-outline'} size={20} color={sel ? colors.primary : colors.muted} />
                      <Text style={[styles.optText, sel && styles.optTextSel]}>{o.label}</Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable style={styles.footBtn} onPress={onClose}>
              <Text style={styles.closeText}>CLOSE</Text>
            </Pressable>
            <View style={styles.footDivider} />
            <Pressable style={styles.footBtn} onPress={() => { onApply(local); onClose(); }}>
              <Text style={styles.applyText}>APPLY</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { height: '88%', backgroundColor: colors.white, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text },
  clear: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.primary },
  panes: { flex: 1, flexDirection: 'row' },
  rail: { width: 130, backgroundColor: colors.surface },
  railItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  railItemActive: { backgroundColor: colors.white },
  railText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted, flex: 1 },
  railTextActive: { fontFamily: fonts.bodySemibold, color: colors.text },
  railCount: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.primary, marginLeft: 4 },
  options: { flex: 1 },
  optRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  optText: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  optTextSel: { fontFamily: fonts.bodySemibold },
  swatchWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  swatchItem: { alignItems: 'center', width: 60, gap: 5 },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  swatchSel: { borderWidth: 2, borderColor: colors.primary },
  swatchText: { fontFamily: fonts.body, fontSize: 11, color: colors.text },
  footer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  footBtn: { flex: 1, paddingVertical: 18, alignItems: 'center' },
  footDivider: { width: 1, height: 28, backgroundColor: colors.border },
  closeText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.muted, letterSpacing: 0.5 },
  applyText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.primary, letterSpacing: 0.5 },
});
