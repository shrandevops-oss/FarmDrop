import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { COLORS as C } from '@/utils/theme';

const s = {
  wrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: C.white },
  top: {
    background: `linear-gradient(145deg, ${C.field}, #1a3517)`,
    padding: '64px 30px 52px',
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 34, fontWeight: 900, color: C.husk,
  },
  logoEm: { color: C.fieldLight },
  tagline: { color: 'rgba(255,255,255,.68)', fontSize: 14, marginTop: 6 },
  card: {
    background: C.white, flex: 1,
    borderRadius: '28px 28px 0 0', padding: '30px 24px',
    marginTop: -20,
  },
  tabs: {
    display: 'flex', background: C.creamDark,
    borderRadius: 20, padding: 4, marginBottom: 24,
  },
  tab: (on) => ({
    flex: 1, background: on ? C.earth : 'none', border: 'none',
    borderRadius: 16, padding: 10, fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    color: on ? C.husk : C.smoke, cursor: 'pointer', transition: '.2s',
  }),
  lbl: {
    fontSize: 11, fontWeight: 600, color: C.smoke,
    marginBottom: 5, letterSpacing: '.3px', textTransform: 'uppercase',
  },
  grp: { marginBottom: 14 },
  inp: {
    width: '100%', background: C.creamDark,
    border: `2px solid transparent`, borderRadius: 12,
    padding: '12px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    color: C.earth, outline: 'none',
  },
  socialRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, margin: '14px 0' },
  socialBtn: {
    border: `2px solid ${C.creamDark}`, borderRadius: 13, padding: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, fontSize: 13, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", color: C.earth,
    background: 'none', cursor: 'pointer',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: 10,
    margin: '4px 0 14px', color: C.smoke, fontSize: 12,
  },
  bigBtn: {
    width: '100%', background: C.field, color: 'white',
    border: 'none', borderRadius: 16, padding: 15,
    fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
  },
  agree: {
    fontSize: 11, color: C.smoke, textAlign: 'center',
    marginTop: 11, lineHeight: 1.6,
  },
  roleRow: {
    display: 'flex', gap: 8, marginBottom: 20,
  },
  roleBtn: (on) => ({
    flex: 1, border: `2px solid ${on ? C.field : C.creamDark}`,
    borderRadius: 13, padding: '10px 6px', textAlign: 'center',
    background: on ? `rgba(58,107,53,.08)` : 'none', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", transition: '.2s',
  }),
  roleIco: { fontSize: 22, display: 'block', marginBottom: 4 },
  roleLbl: (on) => ({ fontSize: 12, fontWeight: 700, color: on ? C.field : C.smoke }),
};

export default function AuthPage() {
  const { login, setRole } = useApp();
  const navigate = useNavigate();

  const [tab, setTab]     = useState('login');
  const [selectedRole, setSelectedRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [form, setForm]   = useState({ name: '', phone: '', email: '', pass: '' });

  const ROLES = [
    { id: 'customer', ico: '🛒', label: 'Customer' },
    { id: 'farmer',   ico: '🌾', label: 'Farmer'   },
    { id: 'agent',    ico: '🛵', label: 'Agent'     },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    login({ name: form.name || 'Ravi Kumar', phone: form.phone || '9876543210', role: selectedRole });
    setRole(selectedRole);
    setLoading(false);
    const dest = selectedRole === 'farmer' ? '/farmer' : selectedRole === 'agent' ? '/agent' : '/';
    navigate(dest);
  };

  return (
    <div style={s.wrap}>
      <div style={s.top}>
        <div style={s.logo}>Farm<span style={s.logoEm}>Drop</span></div>
        <p style={s.tagline}>Fresh rice from farmers · 30 min delivery</p>
      </div>
      <div style={s.card}>
        <div style={s.tabs}>
          {['login','signup'].map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Role selector */}
        <div style={{ fontSize: 11, fontWeight: 600, color: C.smoke, marginBottom: 10, letterSpacing: '.3px', textTransform: 'uppercase' }}>
          I am a…
        </div>
        <div style={s.roleRow}>
          {ROLES.map(r => (
            <button key={r.id} style={s.roleBtn(selectedRole === r.id)} onClick={() => setSelectedRole(r.id)}>
              <span style={s.roleIco}>{r.ico}</span>
              <span style={s.roleLbl(selectedRole === r.id)}>{r.label}</span>
            </button>
          ))}
        </div>

        {tab === 'signup' && (
          <div style={s.grp}>
            <div style={s.lbl}>Full Name</div>
            <input style={s.inp} placeholder="Ravi Kumar"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
          </div>
        )}
        <div style={s.grp}>
          <div style={s.lbl}>Phone Number</div>
          <input style={s.inp} placeholder="+91 98765 43210"
            value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/>
        </div>
        <div style={s.grp}>
          <div style={s.lbl}>Email</div>
          <input style={s.inp} placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
        </div>
        <div style={s.grp}>
          <div style={s.lbl}>Password</div>
          <input style={s.inp} type="password" placeholder="••••••••"
            value={form.pass} onChange={e => setForm({ ...form, pass: e.target.value })}/>
        </div>

        <div style={s.divider}>
          <span style={{ flex: 1, height: 1, background: C.creamDark }}/>
          or continue with
          <span style={{ flex: 1, height: 1, background: C.creamDark }}/>
        </div>
        <div style={s.socialRow}>
          <button style={s.socialBtn} onClick={handleSubmit}>🔵 Google</button>
          <button style={s.socialBtn} onClick={handleSubmit}>📱 OTP</button>
        </div>

        <button style={s.bigBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait…' : tab === 'login' ? '🌾 Login to FarmDrop' : '🚀 Create Account'}
        </button>
        <p style={s.agree}>By continuing, you agree to our <span style={{ color: C.field, fontWeight: 600 }}>Terms</span> & <span style={{ color: C.field, fontWeight: 600 }}>Privacy Policy</span></p>
      </div>
    </div>
  );
}
