import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useApp } from '@/context/AppContext';
import { COLORS as C } from '@/utils/theme';

export default function PaymentSheet({ onClose, onSuccess }) {
  const { items, totalPrice, clearCart } = useCart();
  const { placeOrder } = useApp();
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId]   = useState('');
  const [card, setCard]     = useState({ num: '', exp: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [showSucc, setShowSucc] = useState(false);

  const pay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    placeOrder({ total: totalPrice, items });
    setShowSucc(true);
    setTimeout(() => { setShowSucc(false); onSuccess(); }, 2400);
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)',
    zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  };
  const sheet = {
    background: C.white, width: 430, borderRadius: '24px 24px 0 0',
    padding: '26px 24px 38px', maxHeight: '90vh', overflowY: 'auto',
  };

  if (showSucc) return (
    <div style={{ ...overlay, alignItems: 'center' }}>
      <div style={{ background: C.white, borderRadius: 24, padding: '44px 30px', textAlign: 'center', width: 320 }}>
        <div style={{ fontSize: 68 }}>🎉</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: C.earth, margin: '14px 0 8px' }}>Order Placed!</div>
        <div style={{ fontSize: 13, color: C.smoke, lineHeight: 1.65 }}>
          Your rice is being packed.<br/>Live tracking starts now.<br/><strong>~30 min delivery!</strong>
        </div>
      </div>
    </div>
  );

  return (
    <div style={overlay} onClick={onClose}>
      <div style={sheet} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: C.creamDeep, borderRadius: 2, margin: '0 auto 18px' }}/>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: C.earth, marginBottom: 4 }}>Payment</div>
        <div style={{ fontSize: 13, color: C.smoke, marginBottom: 18 }}>Delivering in ~30 min to Sector 4</div>

        {/* Method picker */}
        <div style={{ display: 'flex', gap: 9, marginBottom: 18 }}>
          {[['upi','📲','UPI'],['card','💳','Card'],['cod','💵','Cash']].map(([id,ic,lb]) => (
            <button key={id} onClick={() => setMethod(id)} style={{
              flex: 1, border: `2px solid ${method === id ? C.field : C.creamDark}`,
              borderRadius: 13, padding: '11px 7px', display: 'flex',
              flexDirection: 'column', alignItems: 'center', gap: 5,
              background: method === id ? 'rgba(58,107,53,.06)' : 'none',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>
              <span style={{ fontSize: 22 }}>{ic}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.earth }}>{lb}</span>
            </button>
          ))}
        </div>

        {method === 'upi' && (
          <>
            <div style={{ background: 'rgba(26,35,126,.06)', border: '2px solid rgba(26,35,126,.14)', borderRadius: 12, padding: 13, marginBottom: 13, display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ fontSize: 26 }}>💳</span>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1A237E' }}>Pay via UPI</div><div style={{ fontSize: 11, color: C.smoke }}>GPay · PhonePe · Paytm · Any UPI app</div></div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.smoke, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.3px' }}>Your UPI ID</div>
            <input style={{ width: '100%', background: C.creamDark, border: '2px solid transparent', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: C.earth, marginBottom: 10, outline: 'none' }} placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)}/>
          </>
        )}

        {method === 'card' && (
          <>
            {[['Card Number','4242 4242 4242 4242','num'],['Cardholder Name','Ravi Kumar','name']].map(([lbl,ph,key]) => (
              <div key={key} style={{ marginBottom: 11 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.smoke, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.3px' }}>{lbl}</div>
                <input style={{ width: '100%', background: C.creamDark, border: '2px solid transparent', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: C.earth, outline: 'none' }} placeholder={ph} value={card[key]} onChange={e => setCard({ ...card, [key]: e.target.value })}/>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {[['Expiry','MM/YY','exp',5],['CVV','•••','cvv',4]].map(([lbl,ph,key,max]) => (
                <div key={key}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.smoke, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.3px' }}>{lbl}</div>
                  <input type={key === 'cvv' ? 'password' : 'text'} style={{ width: '100%', background: C.creamDark, border: '2px solid transparent', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: C.earth, outline: 'none' }} placeholder={ph} maxLength={max} value={card[key]} onChange={e => setCard({ ...card, [key]: e.target.value })}/>
                </div>
              ))}
            </div>
          </>
        )}

        {method === 'cod' && (
          <div style={{ background: 'rgba(74,124,63,.07)', border: '2px solid rgba(74,124,63,.18)', borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 13 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: C.field, marginBottom: 4 }}>💵 Cash on Delivery</div>
            <div style={{ fontSize: 12, color: C.smoke }}>Keep ₹{totalPrice.toLocaleString()} ready.<br/>Exact change appreciated!</div>
          </div>
        )}

        {/* Order summary */}
        {items.map(it => (
          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.creamDark}` }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.earth }}>{it.name} {it.weight} × {it.qty}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.field }}>₹{(it.price * it.qty).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 16px' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.earth }}>Total</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 25, fontWeight: 700, color: C.field }}>₹{totalPrice.toLocaleString()}</span>
        </div>

        <button onClick={pay} disabled={processing} style={{ width: '100%', background: processing ? C.smoke : C.field, color: 'white', border: 'none', borderRadius: 16, padding: 15, fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: processing ? 'not-allowed' : 'pointer' }}>
          {processing ? '⏳ Processing…' : `✓ Pay ₹${totalPrice.toLocaleString()}`}
        </button>
        <button onClick={onClose} style={{ width: '100%', background: 'none', color: C.smoke, border: 'none', padding: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', marginTop: 4 }}>Cancel</button>
      </div>
    </div>
  );
}
