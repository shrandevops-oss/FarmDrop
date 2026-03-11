import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { COLORS as C } from '@/utils/theme';
import { FARMER_INVENTORY } from '@/utils/mockData';

export default function FarmerApp() {
  const { logout } = useApp();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: C.white, paddingBottom: 30 }}>
      {/* Header */}
      <div style={{ background: C.earth, padding: '15px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: C.husk }}>
          Farm<span style={{ color: C.fieldLight }}>Drop</span>
          <span style={{ fontSize: 12, fontWeight: 400, color: 'rgba(232,200,122,.5)', marginLeft: 8 }}>Farmer</span>
        </div>
        <button onClick={() => { logout(); navigate('/auth'); }} style={{ background: 'none', border: `1px solid rgba(232,200,122,.2)`, color: C.husk, borderRadius: 20, padding: '5px 14px', fontSize: 11, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>Logout</button>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(140deg, ${C.field}, #1a3517)`, padding: '28px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(200,151,58,.1)', borderRadius: '50%' }}/>
        <div style={{ background: C.grain, color: C.earth, fontSize: 10, fontWeight: 800, padding: '3px 11px', borderRadius: 20, display: 'inline-block', marginBottom: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>🌾 Farmer Panel</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 27, fontWeight: 900, color: C.white, lineHeight: 1.2, marginBottom: 8, position: 'relative', zIndex: 1 }}>
          Welcome,<br/><span style={{ color: C.husk }}>Muthu Farms</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, position: 'relative', zIndex: 1 }}>Thanjavur District · Active Seller · Zone 3</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.2)', color: 'white', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 30, marginTop: 14 }}>
          <span style={{ width: 7, height: 7, background: '#6BFF6B', borderRadius: '50%', animation: 'pd 1.5s infinite' }}/>
          3 active orders today
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 20px' }}>
        {[['₹12,400','Revenue Today','+18% vs yesterday'],['8','Orders Today','3 in last hour'],['142','Bags In Stock','25kg + 50kg'],['4.9★','Avg Rating','128 reviews']].map(([v,l,t]) => (
          <div key={l} style={{ background: C.earth, borderRadius: 14, padding: 14 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: C.grain }}>{v}</div>
            <div style={{ fontSize: 10, color: 'rgba(232,200,122,.45)', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 2 }}>{l}</div>
            <div style={{ fontSize: 11, color: '#6BFF6B', marginTop: 5, fontWeight: 600 }}>{t}</div>
          </div>
        ))}
      </div>

      {/* Incoming order */}
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: C.earth, padding: '4px 20px 3px' }}>Incoming Orders</div>
      <div style={{ fontSize: 12, color: C.smoke, padding: '0 20px 10px' }}>Accept within 2 min to keep your rating</div>

      {!accepted ? (
        <div style={{ margin: '0 20px 12px', background: `linear-gradient(135deg, ${C.field}, #1a3517)`, borderRadius: 16, padding: 15, color: 'white' }}>
          <div style={{ background: 'rgba(255,255,255,.17)', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '3px 10px', letterSpacing: '1px', textTransform: 'uppercase', display: 'inline-block', marginBottom: 7 }}>🔔 New Order</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, marginBottom: 3 }}>2× Ponni Raw Rice 25kg</div>
          <div style={{ fontSize: 12, opacity: .78 }}>📍 Sector 4 · 3.2 km · Deliver by {new Date(Date.now() + 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => setAccepted(true)} style={{ flex: 1, background: 'white', color: C.field, border: 'none', borderRadius: 10, padding: 9, fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>✓ Accept</button>
            <button style={{ background: 'rgba(255,255,255,.14)', color: 'white', border: '1px solid rgba(255,255,255,.28)', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>Decline</button>
          </div>
        </div>
      ) : (
        <div style={{ margin: '0 20px 12px', background: 'rgba(74,124,63,.1)', border: `2px solid ${C.field}`, borderRadius: 16, padding: 15 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.field }}>✓ Order Accepted — Agent assigned</div>
          <div style={{ fontSize: 12, color: C.smoke, marginTop: 3 }}>Pack 2× Ponni Raw 25kg and keep ready at the gate</div>
        </div>
      )}

      {/* Inventory */}
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: C.earth, padding: '8px 20px 3px' }}>Inventory Status</div>
      <div style={{ padding: '6px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FARMER_INVENTORY.map((it, i) => (
          <div key={i} style={{ background: C.creamDark, borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 26 }}>🌾</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.earth }}>{it.name}</div>
              <div style={{ fontSize: 11, color: C.smoke, marginTop: 1 }}>{it.weight}</div>
              <div style={{ height: 4, background: 'rgba(44,24,16,.1)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, background: i % 2 === 0 ? C.field : C.grain, width: `${(it.count / it.max) * 100}%`, transition: 'width .5s' }}/>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: C.field }}>{it.count}</div>
              <div style={{ fontSize: 10, color: C.smoke }}>bags left</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pd{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.6);}}`}</style>
    </div>
  );
}
