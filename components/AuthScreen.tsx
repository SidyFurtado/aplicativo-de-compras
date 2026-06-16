import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth, authPersistenceReady, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { COLORS, RADII, SHADOWS } from '../constants/theme';

function googleAuthErrorMessage(error: any) {
  const code = error?.code;
  const message = error?.message;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'sidyfurtado.github.io';

  if (code === 'auth/unauthorized-domain') {
    return `Adicione ${hostname} em Firebase Console > Authentication > Settings > Authorized domains.`;
  }

  if (code === 'auth/popup-blocked') {
    return 'O navegador bloqueou a janela do Google. Abra o site direto no Safari/Chrome e toque no botão de novo.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'A janela do Google foi fechada antes do login terminar.';
  }

  return code ? `${code}: ${message}` : message || 'Tente novamente em alguns segundos.';
}

export default function AuthScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    setAuthError(null);

    if (!isFirebaseConfigured) {
      const message = 'Cole o firebaseConfig no arquivo .env e reinicie o servidor.';
      setAuthError(message);
      Alert.alert('Firebase não configurado', message);
      return;
    }

    if (!cleanEmail || password.length < 6) {
      const message = 'Informe um e-mail válido e uma senha com pelo menos 6 caracteres.';
      setAuthError(message);
      Alert.alert('Dados incompletos', message);
      return;
    }

    setLoading(true);
    try {
      await authPersistenceReady;
      await setPersistence(auth, browserLocalPersistence);
      if (mode === 'signIn') {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
      }
    } catch (error: any) {
      const message = error.message || 'Tente novamente em alguns segundos.';
      setAuthError(message);
      Alert.alert('Acesso não concluído', message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);

    if (!isFirebaseConfigured) {
      const message = 'Cole o firebaseConfig no arquivo .env e reinicie o servidor.';
      setAuthError(message);
      Alert.alert('Firebase não configurado', message);
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert('Login Google', 'Por enquanto este app está configurado para uso web no Mac.');
      return;
    }

    setGoogleLoading(true);
    try {
      await authPersistenceReady;
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      const message = googleAuthErrorMessage(error);
      setAuthError(message);
      Alert.alert('Google não concluiu o login', message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, wide && styles.contentWide]}>
        {wide && (
          <View style={styles.contextPanel}>
            <View style={styles.contextHeader}>
              <View style={styles.contextIcon}>
                <Ionicons name="basket" size={22} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.contextKicker}>Casa</Text>
                <Text style={styles.contextTitle}>Compras da semana</Text>
              </View>
            </View>

            <View style={styles.contextTotal}>
              <Text style={styles.contextTotalLabel}>Estimativa aberta</Text>
              <Text style={styles.contextTotalValue}>R$ 248,70</Text>
            </View>

            {[
              ['leaf-outline', 'Feira', '8 itens'],
              ['cart-outline', 'Mercado', '14 itens'],
              ['home-outline', 'Casa', '3 itens'],
            ].map(([icon, label, value]) => (
              <View key={label} style={styles.contextRow}>
                <View style={styles.contextRowIcon}>
                  <Ionicons name={icon as any} size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.contextRowLabel}>{label}</Text>
                <Text style={styles.contextRowValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.authCard}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Ionicons name="cart" size={28} color={AUTH_COLORS.accent} />
            </View>
            <View>
              <Text style={styles.kicker}>Compras da Casa</Text>
              <Text style={styles.brandCaption}>Listas e orçamento</Text>
            </View>
          </View>

          <Text style={styles.title}>{mode === 'signIn' ? 'Entrar' : 'Criar conta'}</Text>
          <Text style={styles.subtitle}>Acesso privado com Firebase Auth e sincronização em tempo real.</Text>

          <View style={styles.form}>
            <TouchableOpacity
              style={[styles.googleButton, !isFirebaseConfigured && styles.buttonDisabled]}
              onPress={signInWithGoogle}
              disabled={googleLoading || !isFirebaseConfigured}
            >
              {googleLoading ? (
                <ActivityIndicator color={AUTH_COLORS.text} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={18} color="#111827" />
                  <Text style={styles.googleText}>Entrar com Google</Text>
                </>
              )}
            </TouchableOpacity>

            {!isFirebaseConfigured && (
              <Text style={styles.configWarning}>
                Configure o .env com os dados do Firebase para ativar o login.
              </Text>
            )}

            {authError && (
              <Text style={styles.authError}>
                {authError}
              </Text>
            )}

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={AUTH_COLORS.muted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                placeholderTextColor={AUTH_COLORS.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={AUTH_COLORS.muted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Senha"
                placeholderTextColor={AUTH_COLORS.muted}
                secureTextEntry
                textContentType="password"
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#062018" />
              ) : (
                <Text style={styles.primaryText}>{mode === 'signIn' ? 'Entrar' : 'Criar conta'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            >
              <Text style={styles.secondaryText}>
                {mode === 'signIn' ? 'Criar uma conta nova' : 'Já tenho conta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const AUTH_COLORS = {
  background: COLORS.background,
  panelSoft: COLORS.cardMuted,
  border: COLORS.border,
  borderStrong: 'rgba(45, 212, 191, 0.32)',
  text: COLORS.textPrimary,
  secondary: COLORS.textSecondary,
  muted: COLORS.textMuted,
  accent: COLORS.primary,
  amber: '#F7C948',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AUTH_COLORS.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  contentWide: {
    flexDirection: 'row',
    gap: 28,
  },
  contextPanel: {
    width: 360,
    minHeight: 430,
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    justifyContent: 'space-between',
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contextIcon: {
    width: 44,
    height: 44,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AUTH_COLORS.borderStrong,
  },
  contextKicker: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  contextTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  contextTotal: {
    borderRadius: RADII.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 6,
  },
  contextTotalLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  contextTotalValue: {
    color: COLORS.primary,
    fontSize: 30,
    fontWeight: '900',
  },
  contextRow: {
    minHeight: 50,
    borderRadius: RADII.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  contextRowIcon: {
    width: 30,
    height: 30,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextRowLabel: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  contextRowValue: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AUTH_COLORS.borderStrong,
  },
  kicker: { color: AUTH_COLORS.text, fontSize: 17, fontWeight: '900' },
  brandCaption: { color: AUTH_COLORS.secondary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  authCard: {
    width: '100%',
    maxWidth: 390,
    minWidth: 300,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
    padding: 22,
    ...SHADOWS.card,
  },
  title: { color: AUTH_COLORS.text, fontSize: 25, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: AUTH_COLORS.secondary, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  form: { gap: 10 },
  googleButton: {
    minHeight: 44,
    borderRadius: RADII.md,
    backgroundColor: '#F5F7FA',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  googleText: { color: '#111827', fontSize: 14, fontWeight: '800' },
  configWarning: { color: AUTH_COLORS.amber, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  authError: {
    color: AUTH_COLORS.amber,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  buttonDisabled: { opacity: 0.45 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: AUTH_COLORS.border },
  dividerText: { color: AUTH_COLORS.muted, fontSize: 12, fontWeight: '700' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: AUTH_COLORS.panelSoft,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: AUTH_COLORS.border,
  },
  input: { flex: 1, minHeight: 44, color: AUTH_COLORS.text, fontSize: 14 },
  primaryButton: {
    minHeight: 46,
    borderRadius: RADII.md,
    backgroundColor: AUTH_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryText: { color: '#061F1B', fontSize: 15, fontWeight: '900' },
  secondaryButton: { minHeight: 38, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: AUTH_COLORS.accent, fontSize: 13, fontWeight: '800' },
});
