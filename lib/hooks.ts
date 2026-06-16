import { useState, useEffect, useCallback } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { ItemCategory } from '../constants/theme';

export type List = {
  id: string;
  name: string;
  category: 'feira' | 'mercado' | 'casa' | 'farmacia' | 'outros';
  created_by: string;
  created_at: string;
  is_archived: boolean;
  item_count?: number;
  checked_count?: number;
};

export type Item = {
  id: string;
  list_id: string;
  created_by?: string;
  name: string;
  quantity: number;
  unit: string;
  priority: 'urgent' | 'normal' | 'low';
  item_category: ItemCategory;
  estimated_price: number | null;
  real_price: number | null;
  is_checked: boolean;
  created_at: string;
  checked_at: string | null;
  note: string | null;
};

export type Purchase = {
  id: string;
  list_id: string;
  created_by?: string;
  total_spent: number;
  date: string;
  notes: string | null;
  list?: List;
};

export type Budget = {
  id: string;
  category: List['category'];
  created_by?: string;
  month: number;
  year: number;
  amount: number;
};

type FirestoreDate = Timestamp | string | null | undefined;

function toIso(value: FirestoreDate) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function byCreatedDesc(a: { created_at: string }, b: { created_at: string }) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

function byCreatedAsc(a: { created_at: string }, b: { created_at: string }) {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

function normalizeList(id: string, data: any): List {
  return {
    id,
    name: data.name || 'Lista sem nome',
    category: data.category || 'outros',
    created_by: data.created_by || 'anonymous',
    created_at: toIso(data.created_at),
    is_archived: Boolean(data.is_archived),
  };
}

function normalizeItem(id: string, data: any): Item {
  return {
    id,
    list_id: data.list_id,
    created_by: data.created_by,
    name: data.name || 'Item',
    quantity: Number(data.quantity || 1),
    unit: data.unit || 'un',
    priority: data.priority || 'normal',
    item_category: data.item_category || 'outros',
    estimated_price: data.estimated_price ?? null,
    real_price: data.real_price ?? null,
    is_checked: Boolean(data.is_checked),
    created_at: toIso(data.created_at),
    checked_at: data.checked_at ? toIso(data.checked_at) : null,
    note: data.note ?? null,
  };
}

function normalizePurchase(id: string, data: any): Purchase {
  return {
    id,
    list_id: data.list_id,
    created_by: data.created_by,
    total_spent: Number(data.total_spent || 0),
    date: data.date || new Date().toISOString().split('T')[0],
    notes: data.notes ?? null,
  };
}

function normalizeBudget(id: string, data: any): Budget {
  return {
    id,
    category: data.category || 'outros',
    created_by: data.created_by,
    month: Number(data.month),
    year: Number(data.year),
    amount: Number(data.amount || 0),
  };
}

export function useLists(archived = false) {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ownerUid = auth.currentUser?.uid || null;

  useEffect(() => {
    if (!ownerUid) {
      setLists([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    let rawLists: List[] = [];
    let itemCountsByList: Record<string, { item_count: number; checked_count: number }> = {};
    let unsubItems: Array<() => void> = [];
    let disposed = false;

    const publish = () => {
      if (disposed) return;
      const next = rawLists
        .filter((list) => list.is_archived === archived)
        .sort(byCreatedDesc)
        .map((list) => {
          const counts = itemCountsByList[list.id] || { item_count: 0, checked_count: 0 };
          return {
            ...list,
            ...counts,
          };
        });
      setLists(next);
      setLoading(false);
    };

    const resetItemSubscriptions = () => {
      unsubItems.forEach((unsubscribe) => unsubscribe());
      unsubItems = [];
      itemCountsByList = {};

      rawLists.forEach((list) => {
        const itemsQuery = query(collection(db, 'items'), where('list_id', '==', list.id));
        const unsubscribe = onSnapshot(
          itemsQuery,
          (snapshot) => {
            const items = snapshot.docs.map((item) => normalizeItem(item.id, item.data()));
            itemCountsByList[list.id] = {
              item_count: items.length,
              checked_count: items.filter((item) => item.is_checked).length,
            };
            publish();
          },
          (err) => {
            setError(err.message);
            publish();
          }
        );
        unsubItems.push(unsubscribe);
      });
    };

    const listsQuery = query(collection(db, 'lists'), where('created_by', '==', ownerUid));
    const unsubLists = onSnapshot(
      listsQuery,
      (snapshot) => {
        rawLists = snapshot.docs.map((item) => normalizeList(item.id, item.data()));
        resetItemSubscriptions();
        publish();
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      disposed = true;
      unsubLists();
      unsubItems.forEach((unsubscribe) => unsubscribe());
    };
  }, [archived, ownerUid]);

  const createList = async (name: string, category: List['category']) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Você precisa estar logado para criar listas.');

    await addDoc(collection(db, 'lists'), {
      name,
      category,
      created_by: uid,
      created_at: serverTimestamp(),
      is_archived: false,
    });
  };

  const archiveList = async (id: string) => {
    await updateDoc(doc(db, 'lists', id), { is_archived: true });
  };

  const deleteList = async (id: string) => {
    await deleteDoc(doc(db, 'lists', id));
  };

  const refetch = useCallback(async () => undefined, []);

  return { lists, loading, error, refetch, createList, archiveList, deleteList };
}

export function useItems(listId: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ownerUid = auth.currentUser?.uid || null;

  useEffect(() => {
    if (!listId || !ownerUid) {
      setItems([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const itemsQuery = query(collection(db, 'items'), where('list_id', '==', listId));
    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const priorityOrder = { urgent: 0, normal: 1, low: 2 };
        const next = snapshot.docs
          .map((item) => normalizeItem(item.id, item.data()))
          .sort((a, b) => {
            if (a.is_checked !== b.is_checked) return a.is_checked ? 1 : -1;
            const priority = priorityOrder[a.priority] - priorityOrder[b.priority];
            return priority || byCreatedAsc(a, b);
          });
        setItems(next);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [listId, ownerUid]);

  const addItem = async (item: Omit<Item, 'id' | 'created_at' | 'checked_at' | 'created_by'>) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Você precisa estar logado para adicionar itens.');

    await addDoc(collection(db, 'items'), {
      ...item,
      created_by: uid,
      created_at: serverTimestamp(),
      checked_at: null,
    });
  };

  const toggleItem = async (id: string, is_checked: boolean, realPrice?: number | null) => {
    const updates: any = {
      is_checked,
      checked_at: is_checked ? new Date().toISOString() : null,
    };
    if (!is_checked) {
      updates.real_price = null;
    } else if (realPrice !== undefined) {
      updates.real_price = realPrice;
    }
    await updateDoc(doc(db, 'items', id), updates);
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    await updateDoc(doc(db, 'items', id), updates);
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'items', id));
  };

  const totalEstimated = items
    .filter(i => !i.is_checked && i.estimated_price)
    .reduce((sum, i) => sum + (i.estimated_price || 0) * i.quantity, 0);

  const refetch = useCallback(async () => undefined, []);

  return { items, loading, error, refetch, addItem, toggleItem, updateItem, deleteItem, totalEstimated };
}

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const ownerUid = auth.currentUser?.uid || null;

  useEffect(() => {
    if (!ownerUid) {
      setPurchases([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    let listsById: Record<string, List> = {};
    let purchasesByList: Record<string, Purchase[]> = {};
    let unsubPurchases: Array<() => void> = [];
    let disposed = false;

    const publish = () => {
      if (disposed) return;
      const rawPurchases = Object.values(purchasesByList).flat();
      setPurchases(
        rawPurchases
          .map((purchase) => ({ ...purchase, list: listsById[purchase.list_id] }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      setLoading(false);
    };

    const resetPurchaseSubscriptions = () => {
      unsubPurchases.forEach((unsubscribe) => unsubscribe());
      unsubPurchases = [];
      purchasesByList = {};

      Object.keys(listsById).forEach((listId) => {
        const purchasesQuery = query(collection(db, 'purchases'), where('list_id', '==', listId));
        const unsubscribe = onSnapshot(purchasesQuery, (snapshot) => {
          purchasesByList[listId] = snapshot.docs.map((item) => normalizePurchase(item.id, item.data()));
          publish();
        });
        unsubPurchases.push(unsubscribe);
      });
    };

    const listsQuery = query(collection(db, 'lists'), where('created_by', '==', ownerUid));
    const unsubLists = onSnapshot(listsQuery, (snapshot) => {
      listsById = Object.fromEntries(snapshot.docs.map((item) => {
        const list = normalizeList(item.id, item.data());
        return [list.id, list];
      }));
      resetPurchaseSubscriptions();
      publish();
    });

    return () => {
      disposed = true;
      unsubLists();
      unsubPurchases.forEach((unsubscribe) => unsubscribe());
    };
  }, [ownerUid]);

  const addPurchase = async (listId: string, totalSpent: number, notes?: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Você precisa estar logado para registrar compras.');

    await addDoc(collection(db, 'purchases'), {
      list_id: listId,
      created_by: uid,
      total_spent: totalSpent,
      date: new Date().toISOString().split('T')[0],
      notes: notes || null,
      created_at: serverTimestamp(),
    });
  };

  const monthlyTotal = (year: number, month: number) => {
    return purchases
      .filter(p => {
        const d = new Date(p.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      })
      .reduce((sum, p) => sum + p.total_spent, 0);
  };

  const categoryTotals = () => {
    const now = new Date();
    const thisMonth = purchases.filter(p => {
      const d = new Date(p.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const totals: Record<string, number> = {};
    thisMonth.forEach(p => {
      const cat = (p.list as any)?.category || 'outros';
      totals[cat] = (totals[cat] || 0) + p.total_spent;
    });
    return totals;
  };

  return { purchases, loading, addPurchase, monthlyTotal, categoryTotals };
}

export function useBudgets(year: number, month: number) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const ownerUid = auth.currentUser?.uid || null;

  useEffect(() => {
    if (!ownerUid) {
      setBudgets([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const budgetsQuery = query(
      collection(db, 'budgets'),
      where('created_by', '==', ownerUid)
    );

    return onSnapshot(budgetsQuery, (snapshot) => {
      const next = snapshot.docs
        .map((item) => normalizeBudget(item.id, item.data()))
        .filter((budget) => budget.year === year && budget.month === month)
        .sort((a, b) => a.category.localeCompare(b.category));
      setBudgets(next);
      setLoading(false);
    }, () => setLoading(false));
  }, [month, ownerUid, year]);

  const setBudget = async (category: Budget['category'], amount: number) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Você precisa estar logado para definir orçamento.');

    const id = `${uid}-${year}-${month}-${category}`;
    await setDoc(doc(db, 'budgets', id), { category, created_by: uid, month, year, amount }, { merge: true });
  };

  const amountFor = (category: Budget['category']) => (
    budgets.find(b => b.category === category)?.amount || 0
  );

  const refetch = useCallback(async () => undefined, []);

  return { budgets, loading, amountFor, setBudget, refetch };
}
