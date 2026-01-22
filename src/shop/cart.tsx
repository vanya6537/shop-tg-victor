import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { CartLine, CartState } from './types';

const STORAGE_KEY = 'shop_cart_v1';

type Action =
  | { type: 'add'; productId: string; qty?: number }
  | { type: 'remove'; productId: string }
  | { type: 'setQty'; productId: string; qty: number }
  | { type: 'clear' }
  | { type: 'hydrate'; state: CartState };

const clampQty = (qty: number) => Math.max(1, Math.min(99, Math.floor(qty || 1)));

const reducer = (state: CartState, action: Action): CartState => {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'clear':
      return { lines: [] };
    case 'add': {
      const qty = clampQty(action.qty ?? 1);
      const existing = state.lines.find((l) => l.productId === action.productId);
      if (!existing) {
        return { lines: [...state.lines, { productId: action.productId, quantity: qty }] };
      }
      return {
        lines: state.lines.map((l) =>
          l.productId === action.productId ? { ...l, quantity: clampQty(l.quantity + qty) } : l
        ),
      };
    }
    case 'remove':
      return { lines: state.lines.filter((l) => l.productId !== action.productId) };
    case 'setQty': {
      const qty = clampQty(action.qty);
      return {
        lines: state.lines.map((l) => (l.productId === action.productId ? { ...l, quantity: qty } : l)),
      };
    }
    default:
      return state;
  }
};

const loadFromStorage = (): CartState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.lines)) return { lines: [] };
    return {
      lines: parsed.lines
        .filter((l: CartLine) => l && typeof l.productId === 'string' && typeof l.quantity === 'number')
        .map((l: CartLine) => ({ productId: l.productId, quantity: clampQty(l.quantity) })),
    };
  } catch {
    return { lines: [] };
  }
};

const saveToStorage = (state: CartState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

type CartApi = {
  state: CartState;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartApi | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, { lines: [] });

  useEffect(() => {
    dispatch({ type: 'hydrate', state: loadFromStorage() });
  }, []);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const api = useMemo<CartApi>(() => {
    const count = state.lines.reduce((sum, l) => sum + l.quantity, 0);
    return {
      state,
      count,
      add: (productId, qty) => dispatch({ type: 'add', productId, qty }),
      remove: (productId) => dispatch({ type: 'remove', productId }),
      setQty: (productId, qty) => dispatch({ type: 'setQty', productId, qty }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [state]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
