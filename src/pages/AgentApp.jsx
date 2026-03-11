import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { COLORS as C } from '@/utils/theme';
import { useTimer } from '@/hooks/useTimer';
import LiveMap from '@/components/shared/LiveMap';
import { AGENT_DELIVERIES } from '@/utils/mockData';

const A = C; // alias for agent colors (dark theme uses same C object)

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatBar({ online, onToggle, earnings, delivCount }) {
  return (
    <div style={{ background: '#161616', padding: '14px 20px', borderBottom: `1px solid #2A2A2A` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: `2px solid ${C.orangeLight}` }}>🛵</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.white }}>Rajan Kumar</div>
            <div style={{ fontSize: 11, color: C.agentGrey, marginTop: 1 }}>Zone 3 · Chennai South</div>
          </div>
        </div>
        <div style={{ background: '#1A1A1A', border: `1px solid #2A2A2A`, borderRadius: 12, padding: '8px 14px', textAlign: 'right' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: C.agentGreen, letterSpacing: '.5px' }}>₹{earnings}</div>
          <div style={{ fontSize: 10, color: C.agentGrey }}>Today's Earnings</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: '#2A2A2A', borderRadius: 14, overflow: 'hidden' }}>
        {[[delivCount,'Deliveries'],['6.4km','Last Trip'],['4.9★','Rating'],['98%','On-Time']].map(([v,l]) => (
          <div key={l} style={{ background: '#1E1E1E', padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: C.white, letterSpacing: '.5px' }}>{v}</div>
            <div style={{ fontSize: 9, color: C.agentGrey, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 1 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewOrderPopup({ pct, onAccept, onDecline }) {
  return (
    <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', width: 398, background: '#161616', border: `2px solid ${C.orange}`, borderRadius: 20, padding: 18, zIndex: 150 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: C.orange, letterSpacing: '.5px' }}>🔔 New Order!</div>
        <div style={{ fontSize: 12, color: C.agentGrey }}>6.4 km · ₹85</div>
      </div>
      <div style={{ background: '#1E1E1E', borderRadius: 12, padding: 12, marginBottom: 12 }}>
        {[['🌾','Pickup: Muthu Farms, Thanjavur'],['↓','2× Ponni Raw 25kg bags'],['🏠','Drop: Sector 4, Chennai']].map(([ic,tx]) => (
          <div key={tx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{ic}</span>
            <span style={{ fontSize: 13, color: ic === '↓' ? C.agentGrey : '#F0F0F0', fontWeight: ic === '↓' ? 400 : 500 }}>{tx}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.agentGrey, whiteSpace: 'nowrap' }}>Auto-declines in</div>
        <div style={{ flex: 1, height: 4, background: '#2A2A2A', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: C.orange, borderRadius: 2, width: `${pct}%`, transition: 'width .5s linear' }}/>
        </div>
        <div style={{ fontSize: 11, color: C.orange, fontWeight: 700, whiteSpace: 'nowrap' }}>{Math.max(1,Math.ceil(pct/20))}s</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={onAccept} style={{ background: C.agentGreen, color: 'white', border: 'none', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 800, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>✓ Accept</button>
        <button onClick={onDecline} style={{ background: '#252525', color: C.agentGrey, border: `1px solid #2A2A2A`, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>✗ Decline</button>
      </div>
      <div style={{ fontSize: 11, color: C.agentGreen, textAlign: 'center', marginTop: 8, fontWeight: 600 }}>💰 Earn ₹85 for this delivery</div>
    </div>
  );
}

// ── Main AgentApp ──────────────────────────────────────────────────────────────
export default function AgentApp() {
  const { logout } = useApp();
  const navigate = useNavigate();
  const [online, setOnline]         = useState(false);
  const [tab, setTab]               = useState('home');
  const [earnTab, setEarnTab]       = useState('today');
  const [phase, setPhase]           = useState(0); // 0=to pickup, 1=to drop, 2=deliver
  const [hasOrder, setHasOrder]     = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [popPct, setPopPct]         = useState(100);
  const [showOTP, setShowOTP]       = useState(false);
  const [showFlash, setShowFlash]   = useState(false);
  const [delivCount, setDelivCount] = useState(6);
  const [earnings, setEarnings]     = useState(412);
  const [otpFilled, setOtpFilled]   = useState([false,false,false,false]);

  const { secs } = useTimer(18 * 60, hasOrder);
  const m = Math.floor(secs / 60), s = secs % 60;
  const mapProgress = phase === 0 ? 0.25 : phase === 1 ? 0.6 : 0.9;

  useEffect(() => {
    if (!online || hasOrder) return;
    const t = setTimeout(() => { setShowNewOrder(true); setPopPct(100); }, 3000);
    return () => clearTimeout(t);
  }, [online, hasOrder]);

  useEffect(() => {
    if (!showNewOrder) return;
    const t = setInterval(() => setPopPct(p => { if (p <= 0) { clearInterval(t); setShowNewOrder(false); return 100; } return p - 2; }), 400);
    return () => clearInterval(t);
  }, [showNewOrder]);

  const acceptOrder = () => { setShowNewOrder(false); setHasOrder(true); setPhase(0); };
  const confirmDelivery = () => {
    setShowOTP(false); setShowFlash(true);
    setDelivCount(c => c + 1); setEarnings(e => e + 85);
    setTimeout(() => {
      setShowFlash(false); setHasOrder(false); setPhase(0); setOtpFilled([false,false,false,false]);
      setTimeout(() => setShowNewOrder(true), 4000);
    }, 2200);
  };

  const NAVS = [
    { id:'home', lbl:'Home', ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id:'earn', lbl:'Earnings', ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
    { id:'hist', lbl:'History', ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { id:'profile', lbl:'Profile', ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', flexDirection: 'column' }}>
      {/* Status bar */}
      <div style={{ background: '#161616', padding: '12px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2A2A2A', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: C.orange, letterSpacing: 1 }}>
          FARMDROP <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: C.white, letterSpacing: 0 }}>Agent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.5px', color: online ? C.agentGreen : C.agentGrey }}>{online ? 'ONLINE' : 'OFFLINE'}</span>
          <button onClick={() => setOnline(o => !o)} style={{ width: 44, height: 24, borderRadius: 12, background: online ? C.agentGreen : '#252525', border: 'none', position: 'relative', cursor: 'pointer' }}>
            <div style={{ width: 18, height: 18, background: 'white', borderRadius: '50%', position: 'absolute', top: 3, left: online ? 23 : 3, transition: 'left .3s', boxShadow: '0 1px 4px rgba(0,0,0,.4)' }}/>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84 }}>
        {/* ── HOME ── */}
        {tab === 'home' && <>
          <StatBar online={online} onToggle={() => setOnline(o => !o)} earnings={earnings} delivCount={delivCount}/>

          {!online && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 30px', textAlign: 'center' }}>
              <div style={{ fontSize: 70, marginBottom: 20 }}>🛵</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: C.white, letterSpacing: 1, marginBottom: 8 }}>You're Offline</div>
              <div style={{ fontSize: 14, color: C.agentGrey, lineHeight: 1.6, marginBottom: 28 }}>Go online to receive orders in Zone 3.<br/>Earn ₹60–₹120 per trip.</div>
              <button onClick={() => setOnline(true)} style={{ background: C.agentGreen, color: 'white', border: 'none', borderRadius: 16, padding: '16px 40px', fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>Go Online</button>
            </div>
          )}

          {online && !hasOrder && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>📡</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: C.white, letterSpacing: 1, marginBottom: 8 }}>Looking for orders…</div>
              <div style={{ fontSize: 13, color: C.agentGrey, lineHeight: 1.6, marginBottom: 24 }}>You're live in Zone 3. New orders will appear here.</div>
              <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontSize: 28 }}>📍</div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Chennai, Zone 3</div>
                  <div style={{ fontSize: 11, color: C.agentGrey }}>3 active orders nearby · Avg wait: 2 min</div>
                </div>
                <div style={{ width: 10, height: 10, background: C.agentGreen, borderRadius: '50%', boxShadow: `0 0 0 4px rgba(29,185,84,.2)` }}/>
              </div>
            </div>
          )}

          {online && hasOrder && <>
            <LiveMap progress={mapProgress} mode="agent"/>
            {/* Active order card */}
            <div style={{ margin: '0 16px 16px', borderRadius: 18, overflow: 'hidden', border: `1.5px solid ${C.orange}`, background: '#1A1A1A' }}>
              <div style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.orangeDark})`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.8)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                    {phase === 0 ? '🚨 HEAD TO PICKUP' : phase === 1 ? '📦 COLLECTED · GO TO DROP' : '🏠 ARRIVE & DELIVER'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, marginTop: 2 }}>Order #FD-2848 · 2× Ponni 25kg</div>
                </div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: 'white', letterSpacing: 1 }}>{m}:{String(s).padStart(2,'0')}</div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  {['📦 50kg total','📍 6.4 km','₹85 earning'].map(chip => (
                    <div key={chip} style={{ background: '#252525', borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: chip.includes('₹') ? C.agentGreen : '#F0F0F0' }}>{chip}</div>
                  ))}
                </div>
                {/* Route */}
                {[
                  { dot: C.orange, type: 'PICKUP', addr: 'Muthu Farms, Thanjavur', sub: 'Gate 2, NH-45 Junction · 3.1 km' },
                  { dot: C.agentGreen, type: 'DROP OFF', addr: 'Ravi Kumar, Sector 4', sub: 'Plot 12, 2nd Cross St · 3.3 km' },
                ].map((rp, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: rp.dot, marginTop: 3, flexShrink: 0 }}/>
                      {i === 0 && <div style={{ width: 2, height: 28, background: '#2A2A2A' }}/>}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: rp.dot }}>{rp.type}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.white, marginTop: 1 }}>{rp.addr}</div>
                      <div style={{ fontSize: 11, color: C.agentGrey, marginTop: 1 }}>{rp.sub}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                  <button onClick={phase === 0 ? () => setPhase(1) : phase === 1 ? () => setPhase(2) : () => setShowOTP(true)} style={{ background: C.orange, color: 'white', border: 'none', borderRadius: 12, padding: 10, fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>
                    {phase === 0 ? '📍 Arrived at Farm' : phase === 1 ? '✅ Picked Up · Head to Drop' : '📦 Confirm Delivery'}
                  </button>
                  <button style={{ background: '#252525', color: C.white, border: `1px solid #2A2A2A`, borderRadius: 12, padding: 10, fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>📞 Call {phase === 0 ? 'Farmer' : 'Customer'}</button>
                </div>
              </div>
            </div>
          </>}
        </>}

        {/* ── EARNINGS ── */}
        {tab === 'earn' && <>
          <div style={{ background: '#161616', padding: '24px 20px', borderBottom: '1px solid #2A2A2A' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, color: C.agentGreen, letterSpacing: 1, lineHeight: 1 }}>₹{earnings}</div>
              <div style={{ fontSize: 13, color: C.agentGrey, marginTop: 4 }}>Total earned today</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: '#2A2A2A', borderRadius: 14, overflow: 'hidden' }}>
              {[['₹2,840','This Week'],['₹11,200','This Month'],['₹62k','All Time']].map(([v,l]) => (
                <div key={l} style={{ background: '#1E1E1E', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: C.agentGreen, letterSpacing: '.5px' }}>{v}</div>
                  <div style={{ fontSize: 9, color: C.agentGrey, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', background: '#1E1E1E', borderRadius: 12, padding: 3, margin: '12px 20px' }}>
            {['today','week','month'].map(t => (
              <button key={t} onClick={() => setEarnTab(t)} style={{ flex: 1, background: earnTab === t ? C.orange : 'none', border: 'none', borderRadius: 10, padding: 8, fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", color: earnTab === t ? 'white' : C.agentGrey, cursor: 'pointer' }}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            {AGENT_DELIVERIES.map((d,i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #2A2A2A' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{d.id} · {d.time}</div>
                  <div style={{ fontSize: 11, color: C.agentGrey, marginTop: 1 }}>{d.from} → {d.to}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.agentGreen }}>+₹{d.earn}</div>
                  <div style={{ fontSize: 11, color: C.agentGrey }}>{d.dist}</div>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* ── HISTORY ── */}
        {tab === 'hist' && <>
          <div style={{ padding: '18px 20px 4px' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: C.white, letterSpacing: .5 }}>Delivery History</div>
            <div style={{ fontSize: 12, color: C.agentGrey, marginTop: 2, marginBottom: 14 }}>{AGENT_DELIVERIES.length + (delivCount - 6)} deliveries completed</div>
          </div>
          {AGENT_DELIVERIES.map((d,i) => (
            <div key={i} style={{ margin: '0 16px 10px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 14, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{d.id}</div>
                  <div style={{ fontSize: 11, color: C.agentGrey }}>{d.time} · Today</div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(29,185,84,.15)', color: C.agentGreen }}>Delivered ✓</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: C.agentGrey }}>{d.from}</span>
                <span style={{ color: C.orange }}>→</span>
                <span style={{ fontSize: 12, color: '#F0F0F0', fontWeight: 500 }}>{d.to}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.agentGreen }}>+₹{d.earn}</span>
                <span style={{ fontSize: 12, color: C.agentGrey }}>🛵 {d.dist}</span>
              </div>
            </div>
          ))}
        </>}

        {/* ── PROFILE ── */}
        {tab === 'profile' && <>
          <div style={{ background: '#161616', padding: '28px 20px 22px', textAlign: 'center', borderBottom: '1px solid #2A2A2A' }}>
            <div style={{ width: 82, height: 82, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orange}, ${C.orangeDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 12px', border: '3px solid rgba(255,107,26,.3)' }}>🛵</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.white }}>Rajan Kumar</div>
            <div style={{ fontSize: 12, color: C.agentGrey, marginTop: 3 }}>Agent ID: FD-AGT-0042 · Zone 3</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
              <span style={{ color: C.agentYellow, fontSize: 16, letterSpacing: 2 }}>★★★★★</span>
              <span style={{ fontSize: 13, color: C.agentGrey }}>4.9 (128 ratings)</span>
            </div>
          </div>
          <div style={{ display: 'flex', background: '#1E1E1E', margin: '16px', borderRadius: 14, overflow: 'hidden', border: '1px solid #2A2A2A' }}>
            {[['142','Deliveries'],['₹62k','Earned'],['98%','On-Time'],['6mo','Active']].map(([v,l]) => (
              <div key={l} style={{ flex: 1, padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #2A2A2A' }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: C.orange }}>{v}</div>
                <div style={{ fontSize: 9, color: C.agentGrey, textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '4px 16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['🪪','My Documents'],['🏦','Bank Account'],['🛵','Vehicle Details'],['🔔','Notifications'],['📞','Support Helpline'],['⚙️','Settings'],['🚪','Logout']].map(([ic,lb]) => (
              <button key={lb} onClick={lb === 'Logout' ? () => { logout(); navigate('/auth'); } : undefined} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 13, padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', width: '100%', fontFamily: "'DM Sans',sans-serif" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14, fontWeight: 500, color: '#F0F0F0' }}>
                  <span style={{ fontSize: 18 }}>{ic}</span>{lb}
                </div>
                <span style={{ color: C.agentGreyD }}>›</span>
              </button>
            ))}
          </div>
        </>}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 430, background: '#161616', display: 'flex', padding: '10px 0 20px', zIndex: 50, borderTop: '1px solid #2A2A2A' }}>
        {NAVS.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', color: tab === n.id ? C.orange : '#555', border: 'none', background: 'none', fontFamily: "'DM Sans',sans-serif", transition: '.2s', position: 'relative' }}>
            {n.id === 'home' && hasOrder && <div style={{ position: 'absolute', top: 0, right: 'calc(50% - 14px)', width: 8, height: 8, background: C.orange, borderRadius: '50%', border: '2px solid #161616' }}/>}
            <div style={{ width: 22, height: 22 }}>{n.ico}</div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase' }}>{n.lbl}</span>
          </button>
        ))}
      </div>

      {/* New order popup */}
      {showNewOrder && <NewOrderPopup pct={popPct} onAccept={acceptOrder} onDecline={() => setShowNewOrder(false)}/>}

      {/* OTP overlay */}
      {showOTP && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#161616', width: 430, borderRadius: '24px 24px 0 0', padding: '28px 24px 40px', borderTop: `2px solid ${C.agentGreen}` }}>
            <div style={{ width: 40, height: 4, background: '#252525', borderRadius: 2, margin: '0 auto 20px' }}/>
            <div style={{ fontSize: 56, textAlign: 'center', marginBottom: 12 }}>📦</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: C.white, textAlign: 'center', letterSpacing: '.5px', marginBottom: 6 }}>Confirm Delivery</div>
            <div style={{ fontSize: 13, color: C.agentGrey, textAlign: 'center', marginBottom: 24 }}>Ask customer for the 4-digit OTP</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
              {otpFilled.map((v,i) => (
                <div key={i} onClick={() => setOtpFilled(p => { const n=[...p]; n[i]=!n[i]; return n; })} style={{ width: 52, height: 60, background: '#1E1E1E', border: `2px solid ${v ? C.agentGreen : '#2A2A2A'}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: v ? C.agentGreen : C.white, cursor: 'pointer' }}>
                  {v ? [1,8,4,2][i] : '_'}
                </div>
              ))}
            </div>
            <button onClick={confirmDelivery} style={{ width: '100%', background: C.agentGreen, color: 'white', border: 'none', borderRadius: 16, padding: 16, fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer' }}>✓ Confirm Delivery</button>
            <button onClick={confirmDelivery} style={{ width: '100%', background: 'none', color: C.agentGrey, border: 'none', padding: 10, fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', marginTop: 4 }}>Skip OTP (customer unavailable)</button>
          </div>
        </div>
      )}

      {/* Success flash */}
      {showFlash && (
        <div style={{ position: 'fixed', inset: 0, background: `rgba(29,185,84,.95)`, zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 80 }}>🎉</div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 42, color: 'white', letterSpacing: 1, margin: '16px 0 8px' }}>DELIVERED!</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,.8)' }}>+₹85 added to your earnings</div>
        </div>
      )}
    </div>
  );
}
