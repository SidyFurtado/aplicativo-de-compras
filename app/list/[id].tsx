import type { ReactNode } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Item, useItems, usePurchases } from '../../lib/hooks';
import { COLORS, ITEM_CATEGORY_META, ItemCategory, PRIORITY_META, Priority, RADII, SHADOWS } from '../../constants/theme';
import AddItemModal from '../../components/AddItemModal';
import RegisterPurchaseModal from '../../components/RegisterPurchaseModal';
import ConfirmItemModal from '../../components/ConfirmItemModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

type StatusFilter = 'all' | 'open' | 'checked';
type PriorityFilter = 'all' | Priority;
type CategoryFilter = 'all' | ItemCategory;

const STATUS_FILTERS: { key: StatusFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'Todos', icon: 'list-outline' },
  { key: 'open', label: 'Restantes', icon: 'ellipse-outline' },
  { key: 'checked', label: 'Comprados', icon: 'checkmark-circle-outline' },
];

function groupItemsByCategory(items: Item[]) {
  const groups = new Map<ItemCategory, Item[]>();

  items.forEach((item) => {
    const category = item.item_category || 'outros';
    const current = groups.get(category) || [];
    current.push(item);
    groups.set(category, current);
  });

  return (Object.keys(ITEM_CATEGORY_META) as ItemCategory[])
    .map((category) => ({ category, items: groups.get(category) || [] }))
    .filter((group) => group.items.length > 0);
}

function CategorySection({
  category,
  items,
  checked,
  renderItem,
}: {
  category: ItemCategory;
  items: Item[];
  checked?: boolean;
  renderItem: (item: Item) => ReactNode;
}) {
  const meta = ITEM_CATEGORY_META[category];
  const total = items.reduce((sum, item) => sum + (item.estimated_price || 0) * item.quantity, 0);

  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIconBox, { backgroundColor: meta.bg }]}> 
          <Ionicons name="grid-outline" size={16} color={meta.color} />
        </View>
        <View style={styles.categoryTitleWrap}>
          <Text style={styles.categoryTitle}>{meta.label}</Text>
          <Text style={styles.categorySubtitle}>
            {items.length} {items.length === 1 ? 'item' : 'itens'}{checked ? ' comprados' : ''}
          </Text>
        </View>
        {total > 0 && !checked && (
          <Text style={[styles.categoryTotal, { color: meta.color }]}>R$ {total.toFixed(2).replace('.', ',')}</Text>
        )}
      </View>
      <View style={styles.categoryItems}>{items.map(renderItem)}</View>
    </View>
  );
}

function ItemRow({
  item,
  onToggle,
  onDeleteConfirm,
  onEdit,
}: {
  item: any;
  onToggle: () => void;
  onDeleteConfirm: () => void;
  onEdit: () => void;
}) {
  const priority = PRIORITY_META[item.priority as Priority];

  return (
    <View style={[styles.itemRow, item.is_checked && styles.itemChecked]}>
      <TouchableOpacity
        style={[styles.checkbox, item.is_checked && styles.checkboxChecked]}
        onPress={onToggle}
        id={`checkbox-${item.id}`}
      >
        {item.is_checked && <Ionicons name="checkmark" size={14} color={COLORS.background} />}
      </TouchableOpacity>

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, item.is_checked && styles.itemNameChecked]}>
            {item.name}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
            <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
            <Text style={[styles.priorityLabel, { color: priority.color }]} numberOfLines={1}>
              {priority.label}
            </Text>
          </View>
        </View>

        <View style={styles.itemMeta}>
          <Text style={styles.itemQuantity}>
            {item.quantity} {item.unit}
          </Text>
          {item.is_checked ? (
            <View style={styles.priceContainer}>
              <Text style={styles.itemPriceReal}>
                R$ {((item.real_price ?? item.estimated_price ?? 0) * item.quantity).toFixed(2).replace('.', ',')}
              </Text>
              {item.real_price !== null && item.estimated_price !== null && (
                (() => {
                  const diff = (item.real_price - item.estimated_price) * item.quantity;
                  if (diff > 0) {
                    return (
                      <View style={[styles.diffBadge, styles.diffBadgeUp]}>
                        <Text style={styles.diffTextUp}>+{diff.toFixed(2).replace('.', ',')}</Text>
                      </View>
                    );
                  } else if (diff < 0) {
                    return (
                      <View style={[styles.diffBadge, styles.diffBadgeDown]}>
                        <Text style={styles.diffTextDown}>-{Math.abs(diff).toFixed(2).replace('.', ',')}</Text>
                      </View>
                    );
                  }
                  return null;
                })()
              )}
            </View>
          ) : (
            item.estimated_price && (
              <Text style={styles.itemPrice}>
                ≈ R$ {(item.estimated_price * item.quantity).toFixed(2).replace('.', ',')}
              </Text>
            )
          )}
          {item.note && (
            <Text style={styles.itemNote} numberOfLines={1}>{item.note}</Text>
          )}
        </View>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={onEdit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.actionButton}
          accessibilityLabel={`Editar ${item.name}`}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDeleteConfirm}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.actionButton, styles.deleteButton]}
          accessibilityLabel={`Apagar ${item.name}`}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, loading, addItem, toggleItem, updateItem, deleteItem, totalEstimated } = useItems(id as string);
  const { addPurchase } = usePurchases();
  const [showAdd, setShowAdd] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [pendingCheckItem, setPendingCheckItem] = useState<Item | null>(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<Item | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const totalOriginalEstimated = items.reduce(
    (sum, i) => sum + (i.estimated_price || 0) * i.quantity,
    0
  );

  const totalRealInCart = items
    .filter((i) => i.is_checked)
    .reduce((sum, i) => sum + (i.real_price ?? i.estimated_price ?? 0) * i.quantity, 0);

  const totalProjected = items.reduce((sum, i) => {
    const price = i.is_checked ? (i.real_price ?? i.estimated_price ?? 0) : (i.estimated_price ?? 0);
    return sum + price * i.quantity;
  }, 0);

  const uncheckedItems = items.filter(i => !i.is_checked);
  const checkedItems = items.filter(i => i.is_checked);
  const filteredItems = items.filter((item) => {
    if (statusFilter === 'open' && item.is_checked) return false;
    if (statusFilter === 'checked' && !item.is_checked) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && item.item_category !== categoryFilter) return false;
    return true;
  });
  const filteredUncheckedItems = filteredItems.filter(i => !i.is_checked);
  const filteredCheckedItems = filteredItems.filter(i => i.is_checked);
  const uncheckedGroups = groupItemsByCategory(filteredUncheckedItems);
  const checkedGroups = groupItemsByCategory(filteredCheckedItems);
  const completion = items.length > 0 ? Math.round((checkedItems.length / items.length) * 100) : 0;
  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all';
  const activeFilterCount = [statusFilter !== 'all', priorityFilter !== 'all', categoryFilter !== 'all']
    .filter(Boolean).length;
  const categoryOptions = (Object.keys(ITEM_CATEGORY_META) as ItemCategory[])
    .filter((category) => items.some((item) => item.item_category === category));

  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} id="btn-back">
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>Lista de Compras</Text>
          <Text style={styles.headerSub}>
            {uncheckedItems.length} restantes • {checkedItems.length} comprados
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd(true)}
          id="btn-add-item"
        >
          <Ionicons name="add" size={22} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      {/* Dashboard de Preços e Carrinho */}
      {(totalOriginalEstimated > 0 || totalRealInCart > 0) && (
        <View style={styles.priceDashboard}>
          <View style={styles.dashboardMain}>
            <View style={styles.dashboardCol}>
              <Text style={styles.dashboardColLabel}>No Carrinho</Text>
              <Text style={styles.dashboardColValueReal}>
                R$ {totalRealInCart.toFixed(2).replace('.', ',')}
              </Text>
            </View>
            <View style={styles.dashboardDivider} />
            <View style={styles.dashboardCol}>
              <Text style={styles.dashboardColLabel}>Total Projetado</Text>
              <Text style={styles.dashboardColValueProjected}>
                R$ {totalProjected.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>

          <View style={styles.dashboardFooter}>
            <Ionicons name="calculator-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.dashboardFooterText}>
              Estimativa: R$ {totalOriginalEstimated.toFixed(2).replace('.', ',')}
              {totalRealInCart > 0 && (() => {
                const diff = totalProjected - totalOriginalEstimated;
                if (diff > 0) {
                  return (
                    <Text style={{ color: COLORS.secondary, fontWeight: '700' }}>
                      {' • '} R$ {diff.toFixed(2).replace('.', ',')} acima
                    </Text>
                  );
                } else if (diff < 0) {
                  return (
                    <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                      {' • '} Economia: R$ {Math.abs(diff).toFixed(2).replace('.', ',')}
                    </Text>
                  );
                }
                return ' • No orçamento';
              })()}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.progressPanel}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressValue}>{completion}%</Text>
          <Text style={styles.progressLabel}>da lista concluída</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completion}%` }]} />
        </View>
      </View>

      {items.length > 0 && (
        <View style={styles.listToolbar}>
          <Text style={styles.resultSummary}>
            {hasActiveFilters ? `${filteredItems.length} de ${items.length} itens` : `${items.length} itens`}
          </Text>

          <View style={styles.filterAnchor}>
            <TouchableOpacity
              style={[styles.filterIconButton, hasActiveFilters && styles.filterIconButtonActive]}
              onPress={() => setFilterOpen((open) => !open)}
              accessibilityLabel="Filtrar lista"
            >
              <Ionicons
                name="filter-outline"
                size={18}
                color={hasActiveFilters ? COLORS.background : COLORS.textSecondary}
              />
              {hasActiveFilters && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {filterOpen && (
              <View style={styles.filterMenu}>
                <View style={styles.filterMenuHeader}>
                  <Text style={styles.filterMenuTitle}>Filtrar</Text>
                  {hasActiveFilters && (
                    <TouchableOpacity onPress={clearFilters} style={styles.filterMenuClear}>
                      <Text style={styles.filterMenuClearText}>Limpar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupLabel}>Status</Text>
                  <View style={styles.filterOptions}>
                    {STATUS_FILTERS.map((filter) => {
                      const active = statusFilter === filter.key;
                      return (
                        <TouchableOpacity
                          key={filter.key}
                          style={[styles.filterPill, active && styles.filterPillActive]}
                          onPress={() => setStatusFilter(filter.key)}
                        >
                          <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                            {filter.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupLabel}>Prioridade</Text>
                  <View style={styles.filterOptions}>
                    <TouchableOpacity
                      style={[styles.filterPill, priorityFilter === 'all' && styles.filterPillActive]}
                      onPress={() => setPriorityFilter('all')}
                    >
                      <Text style={[styles.filterPillText, priorityFilter === 'all' && styles.filterPillTextActive]}>
                        Todas
                      </Text>
                    </TouchableOpacity>
                    {(Object.keys(PRIORITY_META) as Priority[]).map((priority) => {
                      const meta = PRIORITY_META[priority];
                      const active = priorityFilter === priority;
                      return (
                        <TouchableOpacity
                          key={priority}
                          style={[styles.filterPill, active && styles.filterPillActive]}
                          onPress={() => setPriorityFilter(priority)}
                        >
                          <View style={[styles.filterDot, { backgroundColor: meta.color }]} />
                          <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                            {meta.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupLabel}>Categoria</Text>
                  <ScrollView style={styles.categoryFilterScroll} contentContainerStyle={styles.filterOptions}>
                    <TouchableOpacity
                      style={[styles.filterPill, categoryFilter === 'all' && styles.filterPillActive]}
                      onPress={() => setCategoryFilter('all')}
                    >
                      <Text style={[styles.filterPillText, categoryFilter === 'all' && styles.filterPillTextActive]}>
                        Todas
                      </Text>
                    </TouchableOpacity>
                    {categoryOptions.map((category) => {
                      const meta = ITEM_CATEGORY_META[category];
                      const active = categoryFilter === category;
                      return (
                        <TouchableOpacity
                          key={category}
                          style={[styles.filterPill, active && styles.filterPillActive]}
                          onPress={() => setCategoryFilter(category)}
                        >
                          <Text style={styles.categoryFilterIcon}>{meta.icon}</Text>
                          <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                            {meta.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Items */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Urgentes primeiro */}
        {items.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>Lista vazia</Text>
            <Text style={styles.emptyText}>Clique em + para adicionar o primeiro item</Text>
          </View>
        )}

        {items.length > 0 && filteredItems.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyFilterIcon}>
              <Ionicons name="filter-outline" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Nada nesse filtro</Text>
            <Text style={styles.emptyText}>Ajuste os filtros para ver mais itens da lista.</Text>
            <TouchableOpacity style={styles.emptyFilterButton} onPress={clearFilters}>
              <Text style={styles.emptyFilterButtonText}>Limpar filtros</Text>
            </TouchableOpacity>
          </View>
        )}

        {uncheckedGroups.map(group => (
          <CategorySection
            key={group.category}
            category={group.category}
            items={group.items}
            renderItem={(item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={() => setPendingCheckItem(item)}
                onDeleteConfirm={() => setPendingDeleteItem(item)}
                onEdit={() => setEditItem(item)}
              />
            )}
          />
        ))}

        {/* Checked items */}
        {filteredCheckedItems.length > 0 && (
          <>
            <View style={styles.sectionSeparator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>✓ Comprados ({filteredCheckedItems.length})</Text>
              <View style={styles.separatorLine} />
            </View>
            {checkedGroups.map(group => (
              <CategorySection
                key={`checked-${group.category}`}
                category={group.category}
                items={group.items}
                checked
                renderItem={(item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(item.id, false)}
                    onDeleteConfirm={() => setPendingDeleteItem(item)}
                    onEdit={() => setEditItem(item)}
                  />
                )}
              />
            ))}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom action */}
      {checkedItems.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={() => setShowPurchase(true)}
            id="btn-finish-purchase"
          >
            <Ionicons name="card-outline" size={20} color={COLORS.background} />
            <Text style={styles.finishBtnText}>Registrar Compra</Text>
          </TouchableOpacity>
        </View>
      )}

      <AddItemModal
        visible={showAdd || !!editItem}
        onClose={() => { setShowAdd(false); setEditItem(null); }}
        onSave={async (itemData) => {
          if (editItem) {
            await updateItem(editItem.id, itemData);
          } else {
            await addItem({ ...itemData, list_id: id as string, is_checked: false, real_price: null });
          }
          setShowAdd(false);
          setEditItem(null);
        }}
        editItem={editItem}
      />

      <ConfirmItemModal
        visible={!!pendingCheckItem}
        onClose={() => setPendingCheckItem(null)}
        onConfirm={async (realPrice) => {
          if (pendingCheckItem) {
            await toggleItem(pendingCheckItem.id, true, realPrice);
            setPendingCheckItem(null);
          }
        }}
        item={pendingCheckItem}
      />

      <DeleteConfirmModal
        visible={!!pendingDeleteItem}
        title="Apagar item"
        message={`Deseja apagar "${pendingDeleteItem?.name}"? Esta ação não pode ser desfeita.`}
        onClose={() => setPendingDeleteItem(null)}
        onConfirm={() => {
          if (pendingDeleteItem) deleteItem(pendingDeleteItem.id);
        }}
      />

      <RegisterPurchaseModal
        visible={showPurchase}
        onClose={() => setShowPurchase(false)}
        onSave={async (total, notes) => {
          await addPurchase(id as string, total, notes);
          setShowPurchase(false);
        }}
        estimatedTotal={totalRealInCart}
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
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'web' ? 24 : Platform.OS === 'ios' ? 52 : 32,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    width: '100%',
    maxWidth: 924,
    alignSelf: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADII.md,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.28)',
  },
  totalLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  totalValue: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  progressPanel: {
    width: '100%',
    maxWidth: 924,
    alignSelf: 'center',
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 12,
    borderRadius: RADII.md,
    backgroundColor: COLORS.cardMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  progressValue: {
    color: COLORS.textPrimary,
    fontSize: 21,
    fontWeight: '900',
  },
  progressLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  listToolbar: {
    width: '100%',
    maxWidth: 924,
    alignSelf: 'center',
    marginHorizontal: 16,
    marginBottom: 2,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  resultSummary: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  filterAnchor: {
    position: 'relative',
    alignItems: 'flex-end',
    zIndex: 30,
  },
  filterIconButton: {
    width: 36,
    height: 36,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 17,
    height: 17,
    borderRadius: 999,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  filterBadgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '900',
  },
  filterMenu: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 292,
    maxWidth: 292,
    padding: 12,
    borderRadius: RADII.md,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 12,
    ...SHADOWS.card,
  },
  filterMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterMenuTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  filterMenuClear: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  filterMenuClearText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  filterGroup: {
    gap: 7,
  },
  filterGroupLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  categoryFilterScroll: {
    maxHeight: 106,
  },
  filterPill: {
    minHeight: 30,
    borderRadius: RADII.sm,
    paddingHorizontal: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  filterPillTextActive: {
    color: COLORS.primary,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  categoryFilterIcon: {
    fontSize: 13,
  },
  scroll: { flex: 1 },
  scrollContent: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    gap: 7,
  },

  categorySection: {
    gap: 8,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 2,
    paddingTop: 4,
  },
  categoryIconBox: {
    width: 34,
    height: 34,
    borderRadius: RADII.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryIcon: {
    fontSize: 17,
  },
  categoryTitleWrap: {
    flex: 1,
  },
  categoryTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  categorySubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  categoryTotal: {
    fontSize: 13,
    fontWeight: '900',
  },
  categoryItems: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADII.md,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  itemChecked: {
    opacity: 0.55,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: RADII.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  priorityBadge: {
    minHeight: 24,
    maxWidth: 112,
    borderRadius: 999,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 0,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: '900',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemQuantity: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  itemPrice: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  itemNote: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.22)',
  },
  sectionSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  separatorText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
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
  },
  emptyFilterIcon: {
    width: 48,
    height: 48,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFilterButton: {
    minHeight: 38,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginTop: 4,
  },
  emptyFilterButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '800',
  },
  bottomBar: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: 'rgba(5,7,13,0.94)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    ...SHADOWS.glow,
  },
  finishBtnText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '800',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemPriceReal: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  diffBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffBadgeUp: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.28)',
  },
  diffBadgeDown: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.28)',
  },
  diffTextUp: {
    color: COLORS.urgent,
    fontSize: 10,
    fontWeight: '800',
  },
  diffTextDown: {
    color: COLORS.low,
    fontSize: 10,
    fontWeight: '800',
  },
  priceDashboard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADII.md,
    padding: 14,
    marginHorizontal: 28,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    gap: 12,
    ...SHADOWS.card,
    width: '100%',
    maxWidth: 924,
    alignSelf: 'center',
  },
  dashboardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dashboardCol: {
    flex: 1,
    alignItems: 'center',
  },
  dashboardColLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dashboardColValueReal: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  dashboardColValueProjected: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  dashboardDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  dashboardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'center',
  },
  dashboardFooterText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
