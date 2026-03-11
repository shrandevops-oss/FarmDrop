import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [role, setRole]           = useState('customer'); // customer | farmer | agent
  const [cart, setCart]           = useState({});
  const [activeOrder, setActiveOrder] = useState(null);

  const login  = (userData) => setUser(userData);
  const logout = () => { setUser(null); setCart({}); setActiveOrder(null); };

  const addToCart = (productId) =>
    setCart(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));

  const removeFromCart = (productId) =>
    setCart(prev => {
      const next = { ...prev };
      if (next[productId] > 1) next[productId]--;
      else delete next[productId];
      return next;
    });

  const clearCart = () => setCart({});

  const placeOrder = (orderData) => {
    setActiveOrder({ ...orderData, id: `#FD-${Date.now()}`, placedAt: Date.now() });
    clearCart();
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      role, setRole,
      cart, addToCart, removeFromCart, clearCart,
      activeOrder, placeOrder, setActiveOrder,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
