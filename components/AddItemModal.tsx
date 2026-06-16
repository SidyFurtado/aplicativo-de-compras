import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ITEM_CATEGORY_META, ItemCategory, PRIORITY_META, Priority, RADII, SHADOWS, UNITS } from '../constants/theme';
import { Item } from '../lib/hooks';

export type ItemFormData = {
  name: string;
  quantity: number;
  unit: string;
  priority: Priority;
  item_category: ItemCategory;
  estimated_price: number | null;
  note: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (item: ItemFormData) => Promise<void> | void;
  editItem?: Item | null;
};

const ITEM_CATEGORY_ICONS: Record<ItemCategory, keyof typeof Ionicons.glyphMap> = {
  alimentos_basicos: 'restaurant-outline',
  hortifruti: 'leaf-outline',
  carnes_peixes: 'fish-outline',
  frios_laticinios: 'snow-outline',
  padaria: 'cafe-outline',
  bebidas: 'water-outline',
  congelados: 'snow-outline',
  doces_snacks: 'ice-cream-outline',
  limpeza: 'sparkles-outline',
  lavanderia: 'shirt-outline',
  higiene: 'hand-left-outline',
  farmacia_saude: 'medkit-outline',
  bebe_crianca: 'happy-outline',
  pets: 'paw-outline',
  utensilios: 'home-outline',
  moveis: 'cube-outline',
  descartaveis: 'archive-outline',
  organizacao: 'file-tray-stacked-outline',
  eletrodomesticos: 'flash-outline',
  ferramentas: 'hammer-outline',
  papelaria: 'pencil-outline',
  roupas_cama_banho: 'bed-outline',
  outros: 'cube-outline',
};

export default function AddItemModal({ visible, onClose, onSave, editItem }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('un');
  const [priority, setPriority] = useState<Priority>('normal');
  const [itemCategory, setItemCategory] = useState<ItemCategory>('alimentos_basicos');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setQuantity(String(editItem.quantity));
      setUnit(editItem.unit);
      setPriority(editItem.priority);
      setItemCategory(editItem.item_category || 'outros');
      setPrice(editItem.estimated_price ? String(editItem.estimated_price).replace('.', ',') : '');
      setNote(editItem.note || '');
      return;
    }

    if (!visible) {
      setName('');
      setQuantity('1');
      setUnit('un');
      setPriority('normal');
      setItemCategory('alimentos_basicos');
      setPrice('');
      setNote('');
      setSaving(false);
    }
  }, [editItem, visible]);

  const parseNumber = (value: string, fallback: number | null) => {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };

  const submit = async () => {
    const cleanName = name.trim();
    if (!cleanName || saving) return;

    setSaving(true);
    await onSave({
      name: cleanName,
      quantity: parseNumber(quantity, 1) || 1,
      unit,
      priority,
      item_category: itemCategory,
      estimated_price: price.trim() ? parseNumber(price, null) : null,
      note: note.trim() || null,
    });
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{editItem ? 'Editar item' : 'Novo item'}</Text>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Item"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
              maxLength={120}
            />

            <View style={styles.inline}>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Qtd"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                style={[styles.input, styles.qtyInput]}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.units}>
                {UNITS.map(value => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.chip, unit === value && styles.chipActive]}
                    onPress={() => setUnit(value)}
                  >
                    <Text style={[styles.chipText, unit === value && styles.chipTextActive]}>{value}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>


            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Categoria do item</Text>
              <View style={styles.categoryGrid}>
                {(Object.keys(ITEM_CATEGORY_META) as ItemCategory[]).map(key => {
                  const meta = ITEM_CATEGORY_META[key];
                  const active = itemCategory === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.itemCategoryButton,
                        { backgroundColor: active ? meta.bg : COLORS.card },
                        active && { borderColor: meta.color },
                      ]}
                      onPress={() => setItemCategory(key)}
                    >
                      <Ionicons
                        name={ITEM_CATEGORY_ICONS[key]}
                        size={15}
                        color={active ? meta.color : COLORS.textMuted}
                      />
                      <Text style={[styles.itemCategoryText, active && { color: meta.color }]} numberOfLines={1}>
                        {meta.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.priorityRow}>
              {(Object.keys(PRIORITY_META) as Priority[]).map(key => {
                const meta = PRIORITY_META[key];
                const active = priority === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.priorityButton,
                      { backgroundColor: active ? meta.bg : COLORS.card },
                      active && { borderColor: meta.color },
                    ]}
                    onPress={() => setPriority(key)}
                  >
                    <View style={[styles.priorityMark, { backgroundColor: meta.color }]} />
                    <Text style={[styles.priorityText, active && { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="Preço estimado por unidade"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Observação opcional"
              placeholderTextColor={COLORS.textMuted}
              style={[styles.input, styles.noteInput]}
              multiline
              maxLength={500}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, (!name.trim() || saving) && styles.saveButtonDisabled]}
            onPress={submit}
            disabled={!name.trim() || saving}
          >
            <Text style={styles.saveText}>{saving ? 'Salvando...' : editItem ? 'Salvar edição' : 'Adicionar item'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  sheet: {
    width: '92%',
    maxWidth: 520,
    maxHeight: '88%',
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    maxHeight: 460,
  },
  content: {
    gap: 10,
    paddingBottom: 10,
  },
  input: {
    minHeight: 46,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyInput: {
    width: 82,
  },
  units: {
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    minWidth: 46,
    minHeight: 34,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  chipActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: COLORS.primary,
  },

  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemCategoryButton: {
    width: '48%',
    minHeight: 38,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemCategoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  priorityRow: {
    gap: 8,
  },
  priorityButton: {
    minHeight: 40,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priorityMark: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  priorityText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  noteInput: {
    minHeight: 66,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  saveButton: {
    minHeight: 46,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '800',
  },
});
