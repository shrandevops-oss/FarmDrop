// ─── src/context/AppContext.jsx ───────────────────────────────────────────────
// Global state wired to Firebase Auth + Firestore

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, logout as firebaseLogout } from '@/firebase/auth';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [cart, setCart]               = useState({});
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const role = user?.role || 'customer';

  const login  = (userData) => setUser(userData);
  const logout = async () => {
    await firebaseLogout();
    setUser(null);
    setCart({});
    setActiveOrder(null);
  };

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
    setActiveOrder({ ...orderData, placedAt: Date.now() });
    clearCart();
  };

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#1E1208' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:900, color:'#E8C87A', marginBottom:16 }}>
          Farm<span style={{ color:'#6BAF5E' }}>Drop</span>
        </div>
        <div style={{ width:40, height:40, border:'3px solid #C8973A', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, login, logout, loading, role, cart, addToCart, removeFromCart, clearCart, activeOrder, placeOrder, setActiveOrder }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
