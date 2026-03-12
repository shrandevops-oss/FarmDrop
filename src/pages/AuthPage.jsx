// ─── src/pages/AuthPage.jsx ───────────────────────────────────────────────────
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { COLORS as C } from '@/utils/theme';
import { signUpEmail, loginEmail, loginGoogle, sendPhoneOTP, verifyPhoneOTP } from '@/firebase/auth';

export default function AuthPage() {
  const { login } = useApp();
  const navigate  = useNavigate();

  const [tab, setTab]       = useState('login');
  const [method, setMethod] = useState('email');
  const [role, setRole]     = useState('customer');
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [form, setForm]     = useState({ name:'', email:'', password:'', phone:'', otp:'' });

  const f   = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));
  const dest = (r)  => r === 'farmer' ? '/farmer' : r === 'agent' ? '/agent' : '/';

  const handleEmail = async () => {
    setError(''); setLoading(true);
    const res = tab === 'signup'
      ? await signUpEmail({ name:form.name, email:form.email, password:form.password, role, phone:form.phone })
      : await loginEmail({ email:form.email, password:form.password });
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    login(res.user); navigate(dest(res.user.role));
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    const res = await loginGoogle(role);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    login(res.user); navigate(dest(res.user.role));
  };

  const handleSendOTP = async () => {
    setError(''); setLoading(true);
    const phone = form.phone.startsWith('+') ? form.phone : `+91${form.phone}`;
    const res = await sendPhoneOTP(phone, 'recaptcha-container');
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setConfirmResult(res.confirmation); setStep(2);
  };

  const handleVerifyOTP = async () => {
    setError(''); setLoading(true);
    const res = await verifyPhoneOTP(confirmResult, form.otp, role);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    login(res.user); navigate(dest(res.user.role));
  };

  const inp = { width:'100%', background:C.creamDark, border:'2px solid transparent', borderRadius:12, padding:'12px 14px', fontSize:14, fontFamily:"'DM Sans',sans-serif", color:C.earth, outline:'none', marginBottom:11 };
  const lbl = { fontSize:11, fontWeight:600, color:C.smoke, marginBottom:5, letterSpacing:'.3px', textTransform:'uppercase', display:'block' };
  const btn = { width:'100%', background: loading ? C.smoke : C.field, color:'white', border:'none', borderRadius:16, padding:15, fontSize:16, fontWeight:700, fontFamily:"'DM Sans',sans-serif", cursor: loading ? 'not-allowed' : 'pointer', marginTop:4 };
  const errBox = error ? <div style={{ color:C.red, fontSize:13, marginBottom:10, padding:'8px 12px', background:'rgba(192,57,43,.08)', borderRadius:8 }}>⚠️ {error}</div> : null;

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:C.white }}>
      <div style={{ background:`linear-gradient(145deg,${C.field},#1a3517)`, padding:'60px 30px 50px' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:900, color:C.husk }}>Farm<span style={{ color:C.fieldLight }}>Drop</span></div>
        <p style={{ color:'rgba(255,255,255,.68)', fontSize:14, marginTop:6 }}>Fresh rice from farmers · 30 min delivery</p>
      </div>

      <div style={{ background:C.white, flex:1, borderRadius:'28px 28px 0 0', padding:'28px 24px', marginTop:-20 }}>
        {/* Tabs */}
        <div style={{ display:'flex', background:C.creamDark, borderRadius:20, padding:4, marginBottom:22 }}>
          {['login','signup'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setStep(1); }} style={{ flex:1, background:tab===t?C.earth:'none', border:'none', borderRadius:16, padding:10, fontSize:14, fontWeight:600, fontFamily:"'DM Sans',sans-serif", color:tab===t?C.husk:C.smoke, cursor:'pointer', transition:'.2s' }}>
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Role */}
        <div style={{ fontSize:11, fontWeight:600, color:C.smoke, marginBottom:10, letterSpacing:'.3px', textTransform:'uppercase' }}>I am a…</div>
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {[['customer','🛒','Customer'],['farmer','🌾','Farmer'],['agent','🛵','Agent']].map(([id,ico,lb]) => (
            <button key={id} onClick={() => setRole(id)} style={{ flex:1, border:`2px solid ${role===id?C.field:C.creamDark}`, borderRadius:13, padding:'10px 6px', textAlign:'center', background:role===id?'rgba(58,107,53,.08)':'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'.2s' }}>
              <span style={{ fontSize:22, display:'block', marginBottom:4 }}>{ico}</span>
              <span style={{ fontSize:12, fontWeight:700, color:role===id?C.field:C.smoke }}>{lb}</span>
            </button>
          ))}
        </div>

        {/* Method */}
        <div style={{ fontSize:11, fontWeight:600, color:C.smoke, marginBottom:10, letterSpacing:'.3px', textTransform:'uppercase' }}>Sign in with…</div>
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {[['email','✉️','Email'],['phone','📱','OTP'],['google','🔵','Google']].map(([id,ico,lb]) => (
            <button key={id} onClick={() => { setMethod(id); setError(''); setStep(1); }} style={{ flex:1, border:`2px solid ${method===id?C.field:C.creamDark}`, borderRadius:13, padding:'10px 6px', textAlign:'center', background:method===id?'rgba(58,107,53,.08)':'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'.2s' }}>
              <span style={{ fontSize:20, display:'block', marginBottom:4 }}>{ico}</span>
              <span style={{ fontSize:12, fontWeight:700, color:method===id?C.field:C.smoke }}>{lb}</span>
            </button>
          ))}
        </div>

        {/* Email form */}
        {method === 'email' && (<>
          {tab === 'signup' && <div><label style={lbl}>Full Name</label><input style={inp} placeholder="Ravi Kumar" value={form.name} onChange={f('name')}/></div>}
          <div><label style={lbl}>Email Address</label><input style={inp} placeholder="you@example.com" value={form.email} onChange={f('email')}/></div>
          <div><label style={lbl}>Password</label><input style={inp} type="password" placeholder="Min 6 characters" value={form.password} onChange={f('password')}/></div>
          {tab === 'signup' && <div><label style={lbl}>Phone (optional)</label><input style={inp} placeholder="+91 98765 43210" value={form.phone} onChange={f('phone')}/></div>}
          {errBox}
          <button style={btn} onClick={handleEmail} disabled={loading}>{loading ? '⏳ Please wait…' : tab==='login' ? '🌾 Login' : '🚀 Create Account'}</button>
        </>)}

        {/* Google */}
        {method === 'google' && (<>
          <div style={{ background:C.creamDark, borderRadius:14, padding:20, textAlign:'center', marginBottom:16 }}>
            <div style={{ fontSize:44, marginBottom:10 }}>🔵</div>
            <div style={{ fontSize:14, fontWeight:600, color:C.earth, marginBottom:4 }}>Continue with Google</div>
            <div style={{ fontSize:12, color:C.smoke }}>You'll be redirected to Google to sign in securely</div>
          </div>
          {errBox}
          <button style={btn} onClick={handleGoogle} disabled={loading}>{loading ? '⏳ Signing in…' : '🔵 Sign in with Google'}</button>
        </>)}

        {/* Phone OTP */}
        {method === 'phone' && (<>
          {step === 1 && (<>
            <div><label style={lbl}>Phone Number</label><input style={inp} placeholder="+91 98765 43210" value={form.phone} onChange={f('phone')}/></div>
            <div style={{ background:C.creamDark, borderRadius:12, padding:'10px 14px', fontSize:12, color:C.smoke, marginBottom:14 }}>📲 We'll send a 6-digit OTP to verify your number</div>
            {errBox}
            <button style={btn} onClick={handleSendOTP} disabled={loading}>{loading ? '⏳ Sending OTP…' : '📱 Send OTP'}</button>
          </>)}
          {step === 2 && (<>
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ fontSize:44 }}>📲</div>
              <div style={{ fontSize:14, fontWeight:600, color:C.earth, marginTop:8 }}>OTP sent to {form.phone}</div>
              <div style={{ fontSize:12, color:C.smoke, marginTop:4 }}>Enter the 6-digit code below</div>
            </div>
            <div><label style={lbl}>Enter OTP</label><input style={{ ...inp, fontSize:24, fontWeight:700, letterSpacing:10, textAlign:'center' }} placeholder="• • • • • •" maxLength={6} value={form.otp} onChange={f('otp')}/></div>
            {errBox}
            <button style={btn} onClick={handleVerifyOTP} disabled={loading}>{loading ? '⏳ Verifying…' : '✅ Verify & Login'}</button>
            <button onClick={() => { setStep(1); setError(''); }} style={{ width:'100%', background:'none', color:C.smoke, border:'none', padding:10, fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', marginTop:4 }}>← Change number</button>
          </>)}
        </>)}

        <div id="recaptcha-container"/>
        <p style={{ fontSize:11, color:C.smoke, textAlign:'center', marginTop:14, lineHeight:1.6 }}>
          By continuing you agree to our <span style={{ color:C.field, fontWeight:600 }}>Terms</span> & <span style={{ color:C.field, fontWeight:600 }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
