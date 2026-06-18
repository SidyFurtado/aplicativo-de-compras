// Design tokens e constantes do app
import { Platform } from 'react-native';

export const COLORS = {
  // Fundo principal
  background: '#05070D',
  backgroundSoft: '#08111A',
  surface: '#0C1520',
  surfaceElevated: '#101E2B',
  card: '#101B28',
  cardMuted: '#0A121B',

  // Primária - verde esmeralda
  primary: '#35E0C2',
  primaryLight: '#7CF7E3',
  primaryDark: '#0EA98F',
  primaryBg: 'rgba(53, 224, 194, 0.13)',

  // Secundária - violeta contido
  secondary: '#FF8A5B',
  secondaryLight: '#FFB38F',
  secondaryBg: 'rgba(255, 138, 91, 0.12)',

  // Texto
  textPrimary: '#F5F7FA',
  textSecondary: '#B5C3D4',
  textMuted: '#718195',

  // Prioridades
  urgent: '#EF4444',
  urgentBg: 'rgba(239, 68, 68, 0.15)',
  normal: '#F59E0B',
  normalBg: 'rgba(245, 158, 11, 0.15)',
  low: '#10B981',
  lowBg: 'rgba(16, 185, 129, 0.15)',

  // Categorias
  feira: '#22C55E',
  feiraBg: 'rgba(34, 197, 94, 0.15)',
  mercado: '#3B82F6',
  mercadoBg: 'rgba(59, 130, 246, 0.15)',
  casa: '#8B5CF6',
  casaBg: 'rgba(139, 92, 246, 0.15)',
  farmacia: '#EC4899',
  farmaciaBg: 'rgba(236, 72, 153, 0.15)',
  outros: '#F97316',
  outrosBg: 'rgba(249, 115, 22, 0.15)',

  // Bordas e divisores
  border: 'rgba(229, 238, 248, 0.08)',
  borderStrong: 'rgba(229, 238, 248, 0.16)',
  borderFocused: '#35E0C2',

  // Status
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const RADII = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const SHADOWS = {
  card: Platform.OS === 'web'
    ? { boxShadow: '0 18px 34px rgba(0,0,0,0.24)' }
    : {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.24,
        shadowRadius: 34,
        elevation: 10,
      },
  glow: Platform.OS === 'web'
    ? { boxShadow: `0 12px 22px ${COLORS.primary}40` }
    : {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 22,
        elevation: 8,
      },
} as const;

export const CATEGORY_META = {
  feira: {
    label: 'Feira',
    icon: '🥦',
    iconName: 'leaf-outline',
    color: COLORS.feira,
    bg: COLORS.feiraBg,
  },
  mercado: {
    label: 'Mercado',
    icon: '🛒',
    iconName: 'cart-outline',
    color: COLORS.mercado,
    bg: COLORS.mercadoBg,
  },
  casa: {
    label: 'Casa',
    icon: '🏠',
    iconName: 'home-outline',
    color: COLORS.casa,
    bg: COLORS.casaBg,
  },
  farmacia: {
    label: 'Farmácia',
    icon: '💊',
    iconName: 'medkit-outline',
    color: COLORS.farmacia,
    bg: COLORS.farmaciaBg,
  },
  outros: {
    label: 'Outros',
    icon: '📦',
    iconName: 'cube-outline',
    color: COLORS.outros,
    bg: COLORS.outrosBg,
  },
} as const;


export const ITEM_CATEGORY_META = {
  alimentos_basicos: { label: 'Alimentos básicos', icon: '🍚', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)' },
  hortifruti: { label: 'Hortifruti', icon: '🥬', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.15)' },
  carnes_peixes: { label: 'Carnes e peixes', icon: '🥩', color: '#FB7185', bg: 'rgba(251, 113, 133, 0.15)' },
  frios_laticinios: { label: 'Frios e laticínios', icon: '🧀', color: '#FDE047', bg: 'rgba(253, 224, 71, 0.14)' },
  padaria: { label: 'Padaria', icon: '🥖', color: '#FDBA74', bg: 'rgba(253, 186, 116, 0.15)' },
  bebidas: { label: 'Bebidas', icon: '🥤', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' },
  congelados: { label: 'Congelados', icon: '🧊', color: '#67E8F9', bg: 'rgba(103, 232, 249, 0.14)' },
  doces_snacks: { label: 'Doces e snacks', icon: '🍫', color: '#F472B6', bg: 'rgba(244, 114, 182, 0.15)' },
  limpeza: { label: 'Limpeza', icon: '🧼', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' },
  lavanderia: { label: 'Lavanderia', icon: '🧺', color: '#818CF8', bg: 'rgba(129, 140, 248, 0.15)' },
  higiene: { label: 'Higiene pessoal', icon: '🧴', color: '#2DD4BF', bg: 'rgba(45, 212, 191, 0.15)' },
  farmacia_saude: { label: 'Farmácia e saúde', icon: '💊', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.15)' },
  bebe_crianca: { label: 'Bebê e criança', icon: '🧸', color: '#F9A8D4', bg: 'rgba(249, 168, 212, 0.15)' },
  pets: { label: 'Pets', icon: '🐾', color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.15)' },
  utensilios: { label: 'Utensílios', icon: '🍳', color: '#FB923C', bg: 'rgba(251, 146, 60, 0.15)' },
  moveis: { label: 'Móveis', icon: '🪑', color: '#D6A34A', bg: 'rgba(214, 163, 74, 0.15)' },
  descartaveis: { label: 'Descartáveis', icon: '🥡', color: '#A3E635', bg: 'rgba(163, 230, 53, 0.13)' },
  organizacao: { label: 'Organização', icon: '🧰', color: '#CBD5E1', bg: 'rgba(203, 213, 225, 0.12)' },
  eletrodomesticos: { label: 'Eletrodomésticos', icon: '🔌', color: '#93C5FD', bg: 'rgba(147, 197, 253, 0.15)' },
  ferramentas: { label: 'Ferramentas', icon: '🔧', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' },
  papelaria: { label: 'Papelaria', icon: '✏️', color: '#C084FC', bg: 'rgba(192, 132, 252, 0.15)' },
  roupas_cama_banho: { label: 'Roupa, cama e banho', icon: '🧦', color: '#E879F9', bg: 'rgba(232, 121, 249, 0.15)' },
  outros: { label: 'Outros', icon: '📦', color: COLORS.outros, bg: COLORS.outrosBg },
} as const;

export type ItemCategory = keyof typeof ITEM_CATEGORY_META;

export const PRIORITY_META = {
  urgent: {
    label: 'Urgente',
    icon: '🔴',
    color: COLORS.urgent,
    bg: COLORS.urgentBg,
    order: 0,
  },
  normal: {
    label: 'Normal',
    icon: '🟡',
    color: COLORS.normal,
    bg: COLORS.normalBg,
    order: 1,
  },
  low: {
    label: 'Pode esperar',
    icon: '🟢',
    color: COLORS.low,
    bg: COLORS.lowBg,
    order: 2,
  },
} as const;

export const UNITS = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct', 'dz', 'par'];

export type Category = keyof typeof CATEGORY_META;
export type Priority = keyof typeof PRIORITY_META;
