import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { COLORS as C } from '@/utils/theme';
import ShopTab     from '@/components/customer/ShopTab';
import TrackTab    from '@/components/customer/TrackTab';
import OrdersTab   from '@/components/customer/OrdersTab';
import ProfileTab  from '@/components/customer/ProfileTab';

const NAV = [
  { id: 'shop',    label: 'Shop' },
  { id: 'track',   label: 'Track' },
  { id: 'orders',  label: 'Orders' },
  { id: 'profile', label: 'Profile' },
];

const ICONS = {
  shop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  track: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
    </svg>
  ),
};

export default function CustomerApp() {
  const [tab, setTab] = useState('shop');
  const { activeOrder } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: C.white }}>
      {/* Header */}
      <div style={{
        background: C.earth, padding: '15px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: C.husk }}>
          Farm<span style={{ color: C.fieldLight }}>Drop</span>
        </div>
        <div style={{
          background: C.grain, color: C.earth,
          fontSize: 11, fontWeight: 700, padding: '4px 12px',
          borderRadius: 20, letterSpacing: '.5px',
        }}>
          🌾 Zone 3 · Active
        </div>
      </div>

      {/* Page content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84 }}>
        {tab === 'shop'    && <ShopTab />}
        {tab === 'track'   && <TrackTab />}
        {tab === 'orders'  && <OrdersTab />}
        {tab === 'profile' && <ProfileTab onSwitchRole={() => setTab('shop')} />}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 430, background: C.earth,
        display: 'flex', padding: '9px 0 18px', zIndex: 50,
        borderTop: `2px solid ${C.grain}`,
      }}>
        {NAV.map(n => (
          <button key={n.id}
            onClick={() => setTab(n.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3, cursor: 'pointer',
              color: tab === n.id ? C.husk : 'rgba(232,200,122,.3)',
              border: 'none', background: 'none', fontFamily: "'DM Sans', sans-serif",
              transition: '.2s', position: 'relative',
            }}>
            {n.id === 'track' && activeOrder && (
              <div style={{
                position: 'absolute', top: 0, right: 'calc(50% - 13px)',
                width: 7, height: 7, background: C.grain,
                borderRadius: '50%', border: `2px solid ${C.earth}`,
              }}/>
            )}
            <div style={{ width: 21, height: 21 }}>{ICONS[n.id]}</div>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.4px', textTransform: 'uppercase' }}>
              {n.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
