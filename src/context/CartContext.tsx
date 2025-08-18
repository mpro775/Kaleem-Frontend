// src/context/CartContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '../types/Product';

type CartItem = { product: Product; quantity: number };
interface CartProviderProps {
  children: ReactNode;
}
interface CartContextValue {
  items: CartItem[];
  addItem: (p: Product, quantity?: number) => void; // <-- أضف quantity
  removeItem: (id: string) => void;
  clearCart: () => void;
    updateQuantity: (id: string, quantity: number) => void; 
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
const [items, setItems] = useState<CartItem[]>(() => {
  const saved = localStorage.getItem("cart");
  return saved ? JSON.parse(saved) : [];
});
useEffect(() => {
  localStorage.setItem("cart", JSON.stringify(items));
}, [items]);
const addItem = (p: Product, quantity: number = 1) => {
    setItems(prev => {
      const exists = prev.find(i => i.product._id === p._id);
      if (exists) {
        return prev.map(i =>
          i.product._id === p._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product: p, quantity }];
    });
  };
  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev =>
      prev.map(i =>
        i.product._id === id
          ? { ...i, quantity: quantity > 0 ? quantity : 1 }
          : i
      )
    );
  };
  const removeItem = (id: string) =>
    setItems(prev => prev.filter(i => i.product._id !== id));

  const clearCart = () => setItems([]);

    return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
