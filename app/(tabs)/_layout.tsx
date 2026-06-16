import { router, Slot, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { COLORS, RADII, SHADOWS } from '../../constants/theme';

const NAV_ITEMS = [
  { href: '/(tabs)', label: 'Listas', icon: 'list-outline', activeIcon: 'list' },
  { href: '/(tabs)/finances', label: 'Finanças', icon: 'wallet-outline', activeIcon: 'wallet' },
  { href: '/(tabs)/settings', label: 'Configurações', icon: 'settings-outline', activeIcon: 'settings' },
] as const;

export default function DesktopLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < 760;

  const nav = (
    <View style={compact ? styles.bottomNav : styles.nav}>
      {NAV_ITEMS.map((item) => {
        const active = item.href === '/(tabs)'
          ? pathname === '/' || pathname === '/(tabs)'
          : pathname.startsWith(item.href.replace('/(tabs)', ''));

        return (
          <Pressable
            key={item.href}
            style={[compact ? styles.bottomNavItem : styles.navItem, active && styles.navItemActive]}
            onPress={() => router.push(item.href)}
          >
            <Ionicons
              name={(active ? item.activeIcon : item.icon) as any}
              size={compact ? 22 : 20}
              color={active ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[compact ? styles.bottomNavText : styles.navText, active && styles.navTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (compact) {
    return (
      <View style={styles.compactShell}>
        <View style={styles.content}>
          <Slot />
        </View>
        {nav}
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons name="checkmark-done" size={24} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.brandTitle}>Casa Certa</Text>
            <Text style={styles.brandSubtitle}>Casa e orçamento</Text>
          </View>
        </View>

        {nav}

        <View style={styles.sidebarFooter}>
          <View style={styles.footerDot} />
          <View style={styles.footerCopy}>
            <Text style={styles.footerTitle}>Tempo real</Text>
            <Text style={styles.footerText}>Casa sincronizada</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: 18,
    gap: 18,
  },
  compactShell: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sidebar: {
    width: 256,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
  },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: 'rgba(53,224,194,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  brandSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  nav: {
    gap: 6,
    flex: 1,
  },
  navItem: {
    minHeight: 48,
    borderRadius: RADII.md,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: 'rgba(53,224,194,0.22)',
  },
  navText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  navTextActive: {
    color: COLORS.primary,
  },
  sidebarFooter: {
    backgroundColor: COLORS.cardMuted,
    borderRadius: RADII.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  footerCopy: {
    flex: 1,
  },
  footerTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADII.xl,
    overflow: 'hidden',
  },
  bottomNav: {
    minHeight: 66,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    gap: 8,
  },
  bottomNavItem: {
    flex: 1,
    minHeight: 50,
    borderRadius: RADII.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bottomNavText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
});
