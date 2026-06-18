import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Platform,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLists, List } from '../../lib/hooks';
import { COLORS, CATEGORY_META, Category, RADII, SHADOWS } from '../../constants/theme';
import CreateListModal from '../../components/CreateListModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const CATEGORY_FILTERS: { key: 'all' | Category; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'feira', label: 'Feira' },
  { key: 'mercado', label: 'Mercado' },
  { key: 'casa', label: 'Casa' },
  { key: 'farmacia', label: 'Farmácia' },
  { key: 'outros', label: 'Outros' },
];

function ListCard({ list, onDeleteConfirm }: { list: List; onDeleteConfirm: (list: List) => void }) {
  const cat = CATEGORY_META[list.category];
  const total = list.item_count || 0;
  const checked = list.checked_count || 0;
  const progress = total > 0 ? checked / total : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/list/${list.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: cat.bg }]}>
          <Ionicons name={cat.iconName as any} size={14} color={cat.color} />
          <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onDeleteConfirm(list)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.cardAction}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.listName}>{list.name}</Text>

      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: cat.color }]} />
        </View>
        <Text style={styles.progressLabel}>{checked}/{total}</Text>
      </View>

      {total === 0 && (
        <Text style={styles.emptyHint}>Clique para adicionar itens</Text>
      )}
    </TouchableOpacity>
  );
}

export default function ListsScreen() {
  const { lists, loading, refetch, createList, deleteList } = useLists();
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [pendingDeleteList, setPendingDeleteList] = useState<List | null>(null);

  const filtered = filter === 'all' ? lists : lists.filter(l => l.category === filter);
  const totalItems = lists.reduce((sum, list) => sum + (list.item_count || 0), 0);
  const checkedItems = lists.reduce((sum, list) => sum + (list.checked_count || 0), 0);
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const handleCreate = async (name: string, category: Category) => {
    await createList(name, category);
    setShowCreate(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.heroPanel}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={styles.greeting}>Casa e orçamento</Text>
              <Text style={styles.title}>Painel de compras</Text>
              <Text style={styles.subtitle}>Listas, categorias e gastos em um fluxo só.</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreate(true)}
              id="btn-create-list"
            >
              <Ionicons name="add" size={18} color="#06110F" />
              <Text style={styles.addButtonText}>Nova lista</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.overview}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Listas ativas</Text>
              <Text style={styles.overviewValue}>{lists.length}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Itens planejados</Text>
              <Text style={styles.overviewValue}>{totalItems}</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Concluído</Text>
              <Text style={styles.overviewValue}>{progress}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.listsPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelKicker}>Organização</Text>
              <Text style={styles.panelTitle}>Listas</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              {CATEGORY_FILTERS.map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filter, filter === f.key && styles.filterActive]}
                  onPress={() => setFilter(f.key)}
                >
                  {f.key !== 'all' && (
                    <Ionicons
                      name={CATEGORY_META[f.key].iconName as any}
                      size={13}
                      color={filter === f.key ? COLORS.background : COLORS.textMuted}
                    />
                  )}
                  <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="basket-outline" size={34} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Nada planejado ainda</Text>
              <Text style={styles.emptyText}>Crie uma lista limpa, rápida e compartilhada para a próxima compra.</Text>
              <TouchableOpacity style={styles.emptyAction} onPress={() => setShowCreate(true)}>
                <Text style={styles.emptyActionText}>Criar primeira lista</Text>
                <Ionicons name="arrow-forward" size={16} color="#06110F" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {filtered.map(list => (
                <ListCard
                  key={list.id}
                  list={list}
                  onDeleteConfirm={(l) => setPendingDeleteList(l)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <CreateListModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

      <DeleteConfirmModal
        visible={!!pendingDeleteList}
        title="Apagar lista"
        message={`Deseja apagar "${pendingDeleteList?.name}"? Todos os itens da lista serão apagados.`}
        onClose={() => setPendingDeleteList(null)}
        onConfirm={() => {
          if (pendingDeleteList) deleteList(pendingDeleteList.id);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageScroll: {
    flex: 1,
  },
  pageContent: {
    width: '100%',
    maxWidth: 1220,
    alignSelf: 'center',
    paddingHorizontal: 26,
    paddingTop: Platform.OS === 'web' ? 22 : Platform.OS === 'ios' ? 52 : 32,
    paddingBottom: 40,
    gap: 18,
  },
  heroPanel: {
    borderRadius: RADII.xl,
    padding: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 18,
    marginBottom: 22,
  },
  heroCopy: {
    flex: 1,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  addButton: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    ...SHADOWS.glow,
  },
  addButtonText: {
    color: '#06110F',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  overview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewItem: {
    flexGrow: 1,
    flexBasis: 190,
    minHeight: 92,
    padding: 16,
    borderRadius: RADII.lg,
    backgroundColor: COLORS.cardMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  overviewValue: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '900',
  },
  overviewLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listsPanel: {
    borderRadius: RADII.xl,
    padding: 18,
    backgroundColor: COLORS.cardMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  panelKicker: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  panelTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  filtersContainer: {
    flexGrow: 0,
    maxWidth: '72%',
  },
  filtersContent: {
    gap: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  filter: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  filterTextActive: {
    color: COLORS.background,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexGrow: 1,
    flexBasis: 280,
    maxWidth: 380,
    minHeight: 160,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.md,
  },
  cardAction: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  listName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: 0,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.cardMuted,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  emptyHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 390,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 52,
    gap: 12,
    width: '100%',
  },
  emptyIconWrap: {
    width: 86,
    height: 86,
    borderRadius: 30,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: 'rgba(53,224,194,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 21,
    fontWeight: '900',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 30,
  },
  emptyAction: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 10,
  },
  emptyActionText: {
    color: '#06110F',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
});
