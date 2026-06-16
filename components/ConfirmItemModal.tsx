import { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS } from '../constants/theme';
import { Item } from '../lib/hooks';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (realPrice: number | null) => Promise<void> | void;
  item: Item | null;
};

export default function ConfirmItemModal({ visible, onClose, onConfirm, item }: Props) {
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && item) {
      setPrice(item.estimated_price ? String(item.estimated_price).replace('.', ',') : '');
      setSaving(false);
    }
  }, [item, visible]);

  const parsedPrice = price.trim() ? Number(price.replace(',', '.')) : null;
  const quantity = item?.quantity || 1;
  const unit = item?.unit || 'un';

  const subtotal = parsedPrice !== null && Number.isFinite(parsedPrice)
    ? parsedPrice * quantity
    : (item?.estimated_price || 0) * quantity;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const finalPrice = price.trim() ? Number(price.replace(',', '.')) : null;
      await onConfirm(finalPrice);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="cart-outline" size={20} color={COLORS.primary} />
              <Text style={styles.title} numberOfLines={1}>Confirmar Item</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={onClose} disabled={saving}>
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.itemCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>
              Quantidade: {quantity} {unit}
              {item.estimated_price && ` • Estimado: R$ ${item.estimated_price.toFixed(2).replace('.', ',')}`}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preço Unitário Real (R$)</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="Preço pago por unidade"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="decimal-pad"
              style={styles.input}
              editable={!saving}
              autoFocus={Platform.OS !== 'web'}
            />
          </View>

          <View style={styles.subtotalContainer}>
            <Text style={styles.subtotalLabel}>Subtotal no Carrinho</Text>
            <Text style={styles.subtotalValue}>
              R$ {subtotal.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleConfirm}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Confirmando...' : 'Confirmar no Carrinho'}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(0,0,0,0.68)',
  },
  sheet: {
    width: '92%',
    maxWidth: 440,
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 16,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemCard: {
    backgroundColor: COLORS.cardMuted,
    padding: 14,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemMeta: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    gap: 6,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  input: {
    minHeight: 48,
    borderRadius: RADII.md,
    paddingHorizontal: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  subtotalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADII.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(53, 224, 194, 0.22)',
  },
  subtotalLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  subtotalValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: RADII.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 1.5,
    minHeight: 46,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.glow,
  },
  saveBtnText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '800',
  },
});
