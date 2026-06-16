import { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS } from '../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (total: number, notes?: string) => Promise<void> | void;
  estimatedTotal: number;
};

export default function RegisterPurchaseModal({ visible, onClose, onSave, estimatedTotal }: Props) {
  const [total, setTotal] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setTotal(estimatedTotal > 0 ? estimatedTotal.toFixed(2).replace('.', ',') : '');
      setNotes('');
      setSaving(false);
    }
  }, [estimatedTotal, visible]);

  const parsedTotal = Number(total.replace(',', '.'));
  const canSave = Number.isFinite(parsedTotal) && parsedTotal > 0 && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    await onSave(parsedTotal, notes.trim() || undefined);
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar compra</Text>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <TextInput
            value={total}
            onChangeText={setTotal}
            placeholder="Valor total gasto"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Observações"
            placeholderTextColor={COLORS.textMuted}
            multiline
            style={[styles.input, styles.noteInput]}
          />

          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={submit}
            disabled={!canSave}
          >
            <Text style={styles.saveText}>{saving ? 'Registrando...' : 'Salvar compra'}</Text>
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
    maxWidth: 430,
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
  noteInput: {
    minHeight: 74,
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
