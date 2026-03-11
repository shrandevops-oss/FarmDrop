import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { RICE_PRODUCTS } from '@/utils/mockData';
import { COLORS as C } from '@/utils/theme';
import PaymentSheet from '@/components/customer/PaymentSheet';
import { useApp } from '@/context/AppContext';

export default function ShopTab() {
  const { cart, totalItems, totalPrice, addToCart } = useCart();
  const { placeOrder } = useApp();
  const [showPay, setShowPay] = useState(false);

  const handleOrderSuccess = () => {
    setShowPay(false);
  };

  return (
    <>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(140deg, ${C.field} 0%, #1a3517 100%)`,
        padding: '28px 20px 24px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(200,151,58,.1)', borderRadius: '50%' }}/>
        <div style={{ background: C.grain, color: C.earth, fontSize: 10, fontWeight: 800, padding: '3px 11px', borderRadius: 20, display: 'inline-block', marginBottom: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>
          🌾 Farm to Door
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 27, fontWeight: 900, color: C.white, lineHeight: 1.2, marginBottom: 8, position: 'relative', zIndex: 1 }}>
          Fresh Rice,<br/><span style={{ color: C.husk }}>Right to You</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, position: 'relative', zIndex: 1 }}>
          Direct from farmers · 5–9 km range · Chennai
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.2)', color: 'white', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 30, marginTop: 14 }}>
          <span style={{ width: 7, height: 7, background: '#6BFF6B', borderRadius: '50%', animation: 'pd 1.5s infinite' }}/>
          30 min delivery active
        </div>
      </div>

      {/* Zone banner */}
      <div style={{ margin: '12px 20px', background: C.creamDark, borderRadius: 13, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, border: `1.5px solid rgba(74,124,63,.2)` }}>
        <span style={{ fontSize: 21 }}>📍</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.earth }}>Chennai, Zone 3</div>
          <div style={{ fontSize: 11, color: C.smoke }}>Nearest farmer: 6.4 km · ETA 28 min</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.field, background: 'rgba(74,124,63,.1)', padding: '3px 10px', borderRadius: 20 }}>Active</div>
      </div>

      {/* Products */}
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: C.earth, padding: '18px 20px 3px' }}>
        Choose Your Bag
      </div>
      <div style={{ fontSize: 12, color: C.smoke, padding: '0 20px 11px' }}>
        Premium paddy, harvested this season
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '4px 20px 18px' }}>
        {RICE_PRODUCTS.map(r => (
          <div key={r.id} style={{
            background: C.creamDark, borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
            border: `2px solid ${cart[r.id] ? C.field : 'transparent'}`,
            boxShadow: cart[r.id] ? `0 4px 20px rgba(74,124,63,.25)` : 'none',
            transition: '.2s',
          }}>
            <div style={{ width: '100%', height: 106, background: `linear-gradient(135deg, #d4a843, ${C.grain})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
              {r.emoji}
              <div style={{ position: 'absolute', top: 8, right: 8, background: C.earth, color: C.husk, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                {r.weight}
              </div>
            </div>
            <div style={{ padding: 11 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: C.earth, marginBottom: 1 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: C.smoke, marginBottom: 6 }}>{r.origin}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.field }}>
                ₹{r.price.toLocaleString()} <span style={{ fontSize: 11, color: C.smoke, fontWeight: 400 }}>/ bag</span>
              </div>
              <button
                onClick={() => addToCart(r.id)}
                style={{
                  width: '100%', marginTop: 7,
                  background: cart[r.id] ? C.grain : C.field,
                  color: cart[r.id] ? C.earth : 'white',
                  border: 'none', borderRadius: 10, padding: 8,
                  fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                }}>
                {cart[r.id] ? `✓ Added (${cart[r.id]})` : '+ Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart strip */}
      {totalItems > 0 && (
        <div style={{
          background: C.earth, margin: '0 20px 18px', borderRadius: 16,
          padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ color: C.husk }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{totalItems} bag{totalItems > 1 ? 's' : ''} · ₹{totalPrice.toLocaleString()}</div>
            <div style={{ fontSize: 12, opacity: .6 }}>Est. 28–30 min delivery</div>
          </div>
          <button
            onClick={() => setShowPay(true)}
            style={{ background: C.grain, color: C.earth, border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
            Pay & Order →
          </button>
        </div>
      )}

      {/* Payment sheet */}
      {showPay && (
        <PaymentSheet onClose={() => setShowPay(false)} onSuccess={handleOrderSuccess}/>
      )}

      <style>{`@keyframes pd{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.6);}}`}</style>
    </>
  );
}
