import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';
import { COLORS, RADII, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

export default function SettingsScreen() {
  const [user, setUser] = useState(auth.currentUser);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const SettingItem = ({
    icon, label, value, onPress, danger,
  }: {
    icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress?: () => void; danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? COLORS.danger : COLORS.primary} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, danger && { color: COLORS.danger }]}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Preferências</Text>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.card}>
            <SettingItem icon="person-outline" label="E-mail" value={user?.email || '-'} />
            <View style={styles.divider} />
            <SettingItem icon="log-out-outline" label="Sair da conta" onPress={handleSignOut} danger />
          </View>
        </View>

        <View style={[styles.section, styles.sectionWide]}>
          <Text style={styles.sectionTitle}>Firebase</Text>
          <View style={styles.setupCard}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, isFirebaseConfigured ? styles.statusReady : styles.statusPending]} />
              <Text style={styles.statusText}>{isFirebaseConfigured ? 'Configuração ativa' : 'Aguardando .env'}</Text>
            </View>
            <Text style={styles.setupText}>
              {isFirebaseConfigured
                ? 'Authentication e Firestore estão prontos para sincronizar seus dados.'
                : 'Preencha as variáveis EXPO_PUBLIC_FIREBASE_* no .env e reinicie o Expo.'}
            </Text>
            <Text style={styles.setupNote}>
              Use Authentication com Google e Firestore Database no modo test para começar.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.card}>
            <SettingItem icon="phone-portrait-outline" label="Versão" value="1.0.0" />
            <View style={styles.divider} />
            <SettingItem icon="checkmark-done-outline" label="Casa Certa" value="Para uso pessoal" />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <DeleteConfirmModal
        visible={showSignOutConfirm}
        title="Sair da conta"
        message="Deseja realmente sair? Você precisará fazer login novamente."
        confirmLabel="Sair"
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={() => signOut(auth)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'web' ? 26 : Platform.OS === 'ios' ? 54 : 34,
    paddingBottom: 14,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0,
  },
  kicker: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    gap: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  section: {
    gap: 10,
    flexGrow: 1,
    flexBasis: 340,
    maxWidth: 420,
  },
  sectionWide: {
    flexBasis: 520,
    maxWidth: 760,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconDanger: {
    backgroundColor: COLORS.urgentBg,
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  settingValue: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  setupCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  statusReady: {
    backgroundColor: COLORS.success,
  },
  statusPending: {
    backgroundColor: COLORS.warning,
  },
  statusText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  setupText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  sqlBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sqlText: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 16,
  },
  setupNote: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
