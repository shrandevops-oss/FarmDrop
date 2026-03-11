// ── TrackTab ──────────────────────────────────────────────────────────────────
import { useApp } from '@/context/AppContext';
import { COLORS as C } from '@/utils/theme';
import { useTimer } from '@/hooks/useTimer';
import LiveMap from '@/components/shared/LiveMap';
import TimerCircle from '@/components/shared/TimerCircle';
import { DELIVERY_STEPS } from '@/utils/mockData';

export function TrackTab() {
  const { activeOrder } = useApp();
  const { secs, progress } = useTimer(1800, !!activeOrder);
  const elapsed = 1800 - secs;
  const stepIdx = elapsed < 600 ? 1 : elapsed < 1200 ? 2 : elapsed < 1750 ? 3 : 4;

  return (
    <>
      <div style={{ background: `linear-gradient(140deg, ${C.field}, #1a3517)`, padding: '28px 20px 24px' }}>
        <div style={{ background: C.grain, color: C.earth, fontSize: 10, fontWeight: 800, padding: '3px 11px', borderRadius: 20, display: 'inline-block', marginBottom: 10, letterSpacing: '1px', textTransform: 'uppercase' }}>
          🛵 Live Tracking
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 27, fontWeight: 900, color: C.white, lineHeight: 1.2, marginBottom: 6 }}>
          Your Rice<br/><span style={{ color: C.husk }}>Is On The Way!</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>
          {activeOrder ? `${activeOrder.id} · Thanjavur Farms · 6.4 km` : 'No active delivery right now'}
        </p>
      </div>

      {activeOrder ? (
        <>
          <LiveMap progress={progress} mode="customer"/>
          <TimerCircle secs={secs} total={1800} theme="warm"/>
          <div style={{ padding: '0 20px 20px' }}>
            {DELIVERY_STEPS.map((st, i) => {
              const state = i < stepIdx - 1 ? 'done' : i === stepIdx - 1 ? 'act' : 'pend';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '10px 0', position: 'relative' }}>
                  {i < DELIVERY_STEPS.length - 1 && (
                    <div style={{ position: 'absolute', left: 16, top: 40, width: 2, height: 'calc(100% - 16px)', background: C.creamDark }}/>
                  )}
                  <div style={{
                    width: 33, height: 33, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0, zIndex: 1,
                    background: state === 'done' ? C.field : state === 'act' ? C.grain : C.creamDark,
                    boxShadow: state === 'act' ? `0 0 0 0 rgba(200,151,58,.5)` : 'none',
                    animation: state === 'act' ? 'pstep 2s infinite' : 'none',
                  }}>
                    {st.emoji}
                  </div>
                  <div style={{ opacity: state === 'pend' ? .35 : 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.earth, marginBottom: 1 }}>{st.label}</div>
                    <div style={{ fontSize: 12, color: C.smoke }}>{st.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ padding: '50px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 14 }}>🛵</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: C.earth, marginBottom: 8 }}>No active delivery</div>
          <div style={{ fontSize: 13, color: C.smoke }}>Order from Shop tab to start live tracking</div>
        </div>
      )}
      <style>{`@keyframes pstep{0%,100%{box-shadow:0 0 0 0 rgba(200,151,58,.5);}50%{box-shadow:0 0 0 8px rgba(200,151,58,0);}}`}</style>
    </>
  );
}

// ── OrdersTab ─────────────────────────────────────────────────────────────────
import { ORDER_HISTORY } from '@/utils/mockData';

export function OrdersTab() {
  const { activeOrder } = useApp();
  return (
    <>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: C.earth, padding: '18px 20px 3px' }}>Order History</div>
      <div style={{ fontSize: 12, color: C.smoke, padding: '0 20px 12px' }}>{ORDER_HISTORY.length + (activeOrder ? 1 : 0)} total orders</div>

      {activeOrder && (
        <div style={{ margin: '0 20px 12px', background: C.creamDark, borderRadius: 16, padding: 14, borderLeft: `4px solid ${C.grain}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: C.earth }}>{activeOrder.id}</div>
              <div style={{ fontSize: 11, color: C.smoke }}>Just Now</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#cce5ff', color: '#004085' }}>In Transit 🛵</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.smoke }}>
            <span>Rice Bags</span>
            <span style={{ fontWeight: 700, color: C.field, fontSize: 15 }}>₹{activeOrder.total?.toLocaleString()}</span>
          </div>
        </div>
      )}

      {ORDER_HISTORY.map(o => (
        <div key={o.id} style={{ margin: '0 20px 12px', background: C.creamDark, borderRadius: 16, padding: 14, borderLeft: `4px solid ${C.grain}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: C.earth }}>{o.id}</div>
              <div style={{ fontSize: 11, color: C.smoke }}>{o.date}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#d4edda', color: '#1e6b34' }}>Delivered ✓</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.smoke }}>
            <span>{o.items}</span>
            <span style={{ fontWeight: 700, color: C.field, fontSize: 15 }}>₹{o.total.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </>
  );
}

// ── ProfileTab ────────────────────────────────────────────────────────────────
import { useNavigate } from 'react-router-dom';

export function ProfileTab() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const MENU = [
    ['📦','My Orders'],['📍','Delivery Addresses'],['💳','Payment Methods'],
    ['🔔','Notifications'],['📞','Support'],['🔒','Privacy'],['⚙️','Settings'],['🚪','Logout'],
  ];
  const handleMenu = (lb) => {
    if (lb === 'Logout') { logout(); navigate('/auth'); }
  };
  return (
    <>
      <div style={{ background: `linear-gradient(135deg, ${C.field}, #1a3517)`, padding: '30px 20px 22px', textAlign: 'center' }}>
        <div style={{ width: 78, height: 78, borderRadius: '50%', background: C.grain, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 12px', border: '3px solid rgba(255,255,255,.28)' }}>👤</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 21, fontWeight: 700, color: 'white' }}>{user?.name || 'Ravi Kumar'}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.62)', marginTop: 3 }}>📍 Sector 4, Chennai · Zone 3</div>
      </div>
      <div style={{ display: 'flex', background: C.earth, margin: '0 20px', borderRadius: 14, overflow: 'hidden' }}>
        {[['14','Orders'],['₹18k','Spent'],['30m','Avg ETA'],['4.8★','Rating']].map(([v,l]) => (
          <div key={l} style={{ flex: 1, padding: '13px 8px', textAlign: 'center', borderRight: `1px solid rgba(255,255,255,.07)` }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: C.husk }}>{v}</div>
            <div style={{ fontSize: 9, color: 'rgba(232,200,122,.4)', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MENU.map(([ic, lb]) => (
          <button key={lb} onClick={() => handleMenu(lb)} style={{
            background: C.creamDark, borderRadius: 13, padding: '12px 15px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', border: 'none', width: '100%',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, color: C.earth }}>
              <span style={{ fontSize: 18 }}>{ic}</span>{lb}
            </div>
            <span style={{ color: C.smoke }}>›</span>
          </button>
        ))}
      </div>
    </>
  );
}
