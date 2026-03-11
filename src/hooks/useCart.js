import { useApp } from '@/context/AppContext';
import { RICE_PRODUCTS } from '@/utils/mockData';

export function useCart() {
  const { cart, addToCart, removeFromCart, clearCart } = useApp();

  const items = Object.entries(cart).map(([id, qty]) => ({
    ...RICE_PRODUCTS.find(r => r.id === Number(id)),
    qty,
  })).filter(Boolean);

  const totalItems = Object.values(cart).reduce((s, v) => s + v, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);

  return { cart, items, totalItems, totalPrice, addToCart, removeFromCart, clearCart };
}
