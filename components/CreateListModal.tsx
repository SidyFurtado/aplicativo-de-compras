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
import { CATEGORY_META, COLORS, Category, RADII, SHADOWS } from '../constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, category: Category) => Promise<void> | void;
};

export default function CreateListModal({ visible, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('mercado');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setName('');
      setCategory('mercado');
      setSaving(false);
    }
  }, [visible]);

  const submit = async () => {
    const cleanName = name.trim();
    if (!cleanName || saving) return;
    setSaving(true);
    await onCreate(cleanName, category);
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Nova lista</Text>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome da lista"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />

          <View style={styles.categoryGrid}>
            {(Object.keys(CATEGORY_META) as Category[]).map(key => {
              const meta = CATEGORY_META[key];
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: active ? meta.bg : COLORS.surface },
                    active && { borderColor: meta.color },
                  ]}
                  onPress={() => setCategory(key)}
                >
                  <Ionicons name={meta.iconName as any} size={17} color={active ? meta.color : COLORS.textMuted} />
                  <Text style={[styles.categoryText, active && { color: meta.color }]}>
                    {meta.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, (!name.trim() || saving) && styles.saveButtonDisabled]}
            onPress={submit}
            disabled={!name.trim() || saving}
          >
            <Text style={styles.saveText}>{saving ? 'Criando...' : 'Criar lista'}</Text>
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
    maxWidth: 460,
    backgroundColor: COLORS.surfaceElevated,
    padding: 22,
    borderRadius: RADII.xl,
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
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: COLORS.cardMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 52,
    borderRadius: RADII.lg,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    width: '48%',
    minHeight: 48,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    ...SHADOWS.glow,
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
