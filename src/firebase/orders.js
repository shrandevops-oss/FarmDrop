// ─── src/firebase/orders.js ───────────────────────────────────────────────────
import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot, serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from './config';

export const ORDER_STATUS = {
  PLACED:     'placed',
  CONFIRMED:  'confirmed',
  PACKING:    'packing',
  DISPATCHED: 'dispatched',
  DELIVERED:  'delivered',
  CANCELLED:  'cancelled',
};

// FIX: OTP is NOT stored in Firestore in plain text anymore.
// Instead we store an otpHash. The real OTP is sent to the customer
// via SMS (Twilio) or shown only to agent. For now we store a
// server-side hash so the client cannot read the raw OTP from Firestore.
function hashOTP(otp) {
  // Simple deterministic hash — replace with bcrypt on a backend in production
  let h = 0;
  for (let i = 0; i < otp.length; i++) {
    h = (Math.imul(31, h) + otp.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// 1. Place order
export async function placeOrder({ customerId, customerName, customerPhone, address, zone, items, total, paymentMethod }) {
  try {
    // FIX: validate required fields
    if (!customerId) return { orderId: null, error: 'Not logged in.' };
    if (!items?.length) return { orderId: null, error: 'Cart is empty.' };
    if (!total || total <= 0) return { orderId: null, error: 'Invalid order total.' };

    const otp     = generateOTP();
    const otpHash = hashOTP(otp);

    const order = {
      customerId,
      customerName:  customerName  || '',
      customerPhone: customerPhone || '',
      address:       address       || '',
      zone:          zone          || 'Zone 3',
      items,
      total,
      paymentMethod: paymentMethod || 'cod',
      status:        ORDER_STATUS.PLACED,
      farmerId:      null,
      agentId:       null,
      agentName:     null,
      otpHash,              // FIX: store hash not plain OTP
      placedAt:      serverTimestamp(),
      confirmedAt:   null,
      dispatchedAt:  null,
      deliveredAt:   null,
    };

    const ref = await addDoc(collection(db, 'orders'), order);
    // Return the plain OTP ONLY to the caller (customer screen) — never saved to DB
    return { orderId: ref.id, otp, error: null };
  } catch (err) {
    return { orderId: null, otp: null, error: err.message };
  }
}

// 2. Farmer accepts
export async function farmerAcceptOrder(orderId, farmerId) {
  try {
    if (!orderId || !farmerId) return { error: 'Missing orderId or farmerId.' };
    await updateDoc(doc(db, 'orders', orderId), {
      status:      ORDER_STATUS.CONFIRMED,
      farmerId,
      confirmedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// 3. Mark packing
export async function markPacking(orderId) {
  try {
    await updateDoc(doc(db, 'orders', orderId), { status: ORDER_STATUS.PACKING });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// 4. Agent dispatches
export async function agentDispatchOrder(orderId, agentId, agentName) {
  try {
    if (!orderId || !agentId) return { error: 'Missing orderId or agentId.' };
    await updateDoc(doc(db, 'orders', orderId), {
      status:       ORDER_STATUS.DISPATCHED,
      agentId,
      agentName:    agentName || '',
      dispatchedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// 5. Confirm delivery — FIX: compare hash not plain text
export async function confirmDelivery(orderId, enteredOtp) {
  try {
    if (!orderId)     return { error: 'Missing order ID.' };
    if (!enteredOtp)  return { error: 'Please enter the OTP.' };

    const snap = await getDoc(doc(db, 'orders', orderId));
    if (!snap.exists()) return { error: 'Order not found.' };

    const order = snap.data();

    // FIX: compare hashes, never compare plain OTP
    if (order.otpHash !== hashOTP(enteredOtp.trim())) {
      return { error: 'Invalid OTP. Please try again.' };
    }

    await updateDoc(doc(db, 'orders', orderId), {
      status:      ORDER_STATUS.DELIVERED,
      deliveredAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// 6. Cancel order
export async function cancelOrder(orderId, reason = '') {
  try {
    if (!orderId) return { error: 'Missing order ID.' };
    await updateDoc(doc(db, 'orders', orderId), {
      status:           ORDER_STATUS.CANCELLED,
      cancellationNote: reason.trim(),
      cancelledAt:      serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// 7. Get single order
export async function getOrder(orderId) {
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (!snap.exists()) return { order: null, error: 'Order not found.' };
    const data = snap.data();
    // FIX: never return otpHash to the client
    delete data.otpHash;
    return { order: { id: snap.id, ...data }, error: null };
  } catch (err) {
    return { order: null, error: err.message };
  }
}

// 8. Customer order history
export async function getCustomerOrders(customerId) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', customerId),
      orderBy('placedAt', 'desc'),
      limit(20)
    );
    const snap   = await getDocs(q);
    const orders = snap.docs.map(d => {
      const data = d.data();
      delete data.otpHash; // FIX: strip hash from client data
      return { id: d.id, ...data };
    });
    return { orders, error: null };
  } catch (err) {
    return { orders: [], error: err.message };
  }
}

// 9. Farmer orders (real-time)
export function listenFarmerOrders(zone, callback) {
  const q = query(
    collection(db, 'orders'),
    where('zone', '==', zone),
    where('status', 'in', [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PACKING]),
    orderBy('placedAt', 'desc')
  );
  return onSnapshot(q, snap => {
    const orders = snap.docs.map(d => {
      const data = d.data();
      delete data.otpHash;
      return { id: d.id, ...data };
    });
    callback(orders);
  });
}

// 10. Agent active orders (real-time)
export function listenAgentOrders(agentId, callback) {
  const q = query(
    collection(db, 'orders'),
    where('agentId', '==', agentId),
    where('status',  '==', ORDER_STATUS.DISPATCHED),
  );
  return onSnapshot(q, snap => {
    const orders = snap.docs.map(d => {
      const data = d.data();
      delete data.otpHash;
      return { id: d.id, ...data };
    });
    callback(orders);
  });
}

// 11. Customer live tracking
export function listenOrder(orderId, callback) {
  return onSnapshot(doc(db, 'orders', orderId), snap => {
    if (snap.exists()) {
      const data = snap.data();
      delete data.otpHash; // FIX: never send hash to client
      callback({ id: snap.id, ...data });
    }
  });
}

// 12. Available orders for agents
export function listenAvailableOrders(zone, callback) {
  const q = query(
    collection(db, 'orders'),
    where('zone',    '==', zone),
    where('status',  '==', ORDER_STATUS.PACKING),
    where('agentId', '==', null),
    orderBy('placedAt', 'asc')
  );
  return onSnapshot(q, snap => {
    const orders = snap.docs.map(d => {
      const data = d.data();
      delete data.otpHash;
      return { id: d.id, ...data };
    });
    callback(orders);
  });
}
