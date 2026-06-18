import {
  Modal, View, Text, StyleSheet, ScrollView, Platform,
  TextInput, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Budget, useBudgets, usePurchases } from '../../lib/hooks';
import { Category, COLORS, CATEGORY_META, RADII, SHADOWS } from '../../constants/theme';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function StatCard({ icon, label, value, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function BudgetModal({
  visible,
  category,
  currentAmount,
  onClose,
  onSave,
}: {
  visible: boolean;
  category: Category | null;
  currentAmount: number;
  onClose: () => void;
  onSave: (amount: number) => Promise<void> | void;
}) {
  const [amount, setAmount] = useState('');

  const meta = category ? CATEGORY_META[category] : CATEGORY_META.outros;
  const parsed = Number(amount.replace(',', '.'));

  useEffect(() => {
    if (visible) {
      setAmount(currentAmount > 0 ? String(currentAmount).replace('.', ',') : '');
    }
  }, [currentAmount, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={[styles.modalIcon, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.iconName as any} size={18} color={meta.color} />
              </View>
              <Text style={styles.modalTitle}>Orçamento de {meta.label}</Text>
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Valor mensal"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            style={styles.budgetInput}
          />
          <TouchableOpacity
            style={[styles.saveBudgetButton, (!Number.isFinite(parsed) || parsed < 0) && styles.saveBudgetDisabled]}
            disabled={!Number.isFinite(parsed) || parsed < 0}
            onPress={async () => {
              await onSave(parsed);
              onClose();
            }}
          >
            <Text style={styles.saveBudgetText}>Salvar orçamento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function FinancesScreen() {
  const { purchases, loading, monthlyTotal, categoryTotals } = usePurchases();
  const [budgetCategory, setBudgetCategory] = useState<Category | null>(null);

  const now = new Date();
  const { amountFor, setBudget } = useBudgets(now.getFullYear(), now.getMonth() + 1);
  const currentMonthTotal = monthlyTotal(now.getFullYear(), now.getMonth() + 1);
  const lastMonthTotal = monthlyTotal(
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
    now.getMonth() === 0 ? 12 : now.getMonth()
  );

  const catTotals = categoryTotals();
  const recentPurchases = purchases.slice(0, 10);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.kicker}>Controle mensal</Text>
        <Text style={styles.title}>Finanças</Text>
        <Text style={styles.subtitle}>{monthNames[now.getMonth()]} {now.getFullYear()}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Month stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="calendar-outline"
            label="Este mês"
            value={formatCurrency(currentMonthTotal)}
            color={COLORS.primary}
          />
          <StatCard
            icon="time-outline"
            label="Mês passado"
            value={formatCurrency(lastMonthTotal)}
            color={COLORS.secondary}
          />
        </View>

        {/* Comparison */}
        {lastMonthTotal > 0 && currentMonthTotal !== lastMonthTotal && (
          <View style={styles.comparisonCard}>
            {currentMonthTotal < lastMonthTotal ? (
              <>
                <Ionicons name="trending-down-outline" size={24} color={COLORS.success} />
                <Text style={styles.comparisonText}>
                  Você gastou{' '}
                  <Text style={{ color: COLORS.success, fontWeight: '700' }}>
                    {formatCurrency(lastMonthTotal - currentMonthTotal)} a menos
                  </Text>{' '}
                  que no mês passado!
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="trending-up-outline" size={24} color={COLORS.danger} />
                <Text style={styles.comparisonText}>
                  Você gastou{' '}
                  <Text style={{ color: COLORS.danger, fontWeight: '700' }}>
                    {formatCurrency(currentMonthTotal - lastMonthTotal)} a mais
                  </Text>{' '}
                  que no mês passado.
                </Text>
              </>
            )}
          </View>
        )}

        {/* By category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por Categoria</Text>
          {(Object.keys(CATEGORY_META) as Category[]).map(cat => {
              const total = catTotals[cat] || 0;
              const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META] || CATEGORY_META.outros;
              const pct = currentMonthTotal > 0 ? (total / currentMonthTotal) * 100 : 0;
              const budget = amountFor(cat as Budget['category']);
              const budgetPct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
              return (
                <TouchableOpacity key={cat} style={styles.catRow} onPress={() => setBudgetCategory(cat)}>
                  <View style={[styles.catIconBox, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.iconName as any} size={19} color={meta.color} />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={styles.catLabel}>{meta.label}</Text>
                      <Text style={[styles.catAmount, { color: meta.color }]}>
                        {formatCurrency(total)}
                      </Text>
                    </View>
                    <View style={styles.catBar}>
                      <View
                        style={[
                          styles.catBarFill,
                          { width: `${pct}%`, backgroundColor: meta.color }
                        ]}
                      />
                    </View>
                    <Text style={styles.catPct}>
                      {pct.toFixed(0)}% do total
                      {budget > 0 ? ` • ${budgetPct.toFixed(0)}% de ${formatCurrency(budget)}` : ' • toque para definir orçamento'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
          })}
        </View>

        {/* Recent purchases */}
        {recentPurchases.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico Recente</Text>
            {recentPurchases.map(p => {
              const list = p.list as any;
              const cat = list?.category || 'outros';
              const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META] || CATEGORY_META.outros;
              const date = new Date(p.date);
              return (
                <View key={p.id} style={styles.purchaseRow}>
                  <View style={[styles.purchaseIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.iconName as any} size={17} color={meta.color} />
                  </View>
                  <View style={styles.purchaseInfo}>
                    <Text style={styles.purchaseName}>{list?.name || 'Compra'}</Text>
                    <Text style={styles.purchaseDate}>
                      {date.toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text style={styles.purchaseAmount}>{formatCurrency(p.total_spent)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {recentPurchases.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>Nenhuma compra registrada</Text>
            <Text style={styles.emptyText}>
              Ao finalizar uma lista, registre o valor gasto para acompanhar aqui.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BudgetModal
        visible={!!budgetCategory}
        category={budgetCategory}
        currentAmount={budgetCategory ? amountFor(budgetCategory) : 0}
        onClose={() => setBudgetCategory(null)}
        onSave={(amount) => budgetCategory ? setBudget(budgetCategory, amount) : undefined}
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
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    gap: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 250,
    maxWidth: 360,
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: 14,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: RADII.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  comparisonCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADII.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  comparisonText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    width: '100%',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexGrow: 1,
    flexBasis: 340,
    maxWidth: 520,
    ...SHADOWS.card,
  },
  catIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADII.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catInfo: { flex: 1 },
  catLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  catAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  catBar: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  catPct: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  modalSheet: {
    width: '92%',
    maxWidth: 430,
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  modalIcon: {
    width: 32,
    height: 32,
    borderRadius: RADII.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetInput: {
    minHeight: 46,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  saveBudgetButton: {
    minHeight: 46,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBudgetDisabled: {
    opacity: 0.45,
  },
  saveBudgetText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '800',
  },
  purchaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  purchaseIcon: {
    width: 36,
    height: 36,
    borderRadius: RADII.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseInfo: { flex: 1 },
  purchaseName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  purchaseDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  purchaseAmount: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 30,
  },
});
