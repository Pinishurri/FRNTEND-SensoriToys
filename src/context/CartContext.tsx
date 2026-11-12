import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Producto } from '../services/producto.service';

export interface CartItem extends Producto {
  cantidad: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (producto: Producto) => void;
  removeFromCart: (productoId: number) => void;
  updateQuantity: (productoId: number, cantidad: number) => void;
  clearCart: () => void;
  total: number;
}

const CART_STORAGE_KEY = 'cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

const leerCarrito = (): CartItem[] => {
  try {
    const guardado = localStorage.getItem(CART_STORAGE_KEY);
    return guardado ? (JSON.parse(guardado) as CartItem[]) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(leerCarrito);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (producto: Producto) => {
    if (producto.stock <= 0) return;
    setCart((prevCart) => {
      const existente = prevCart.find((item) => item.id === producto.id);
      if (existente) {
        return prevCart.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.stock) }
            : item
        );
      }
      return [...prevCart, { ...producto, cantidad: 1 }];
    });
  };

  const removeFromCart = (productoId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productoId));
  };

  const updateQuantity = (productoId: number, cantidad: number) => {
    if (cantidad < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productoId ? { ...item, cantidad: Math.min(cantidad, item.stock) } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};
