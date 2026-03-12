// ─── src/firebase/orders.js ───────────────────────────────────────────────────
// Full order lifecycle: place → confirm → pack → dispatch → deliver

import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot, serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from './config';

// ── Order Status Flow ──────────────────────────────────────────────────────────
// placed → confirmed → packing → dispatched → delivered → cancelled
export const ORDER_STATUS = {
  PLACED:     'placed',
  CONFIRMED:  'confirmed',
  PACKING:    'packing',
  DISPATCHED: 'dispatched',
  DELIVERED:  'delivered',
  CANCELLED:  'cancelled',
};

// ── 1. Place a new order ───────────────────────────────────────────────────────
export async function placeOrder({ customerId, customerName, customerPhone, address, zone, items, total, paymentMethod }) {
  try {
    const order = {
      customerId,
      customerName,
      customerPhone,
      address,
      zone,
      items,          // [{ id, name, weight, qty, price }]
      total,
      paymentMethod,  // upi | card | cod
      status:         ORDER_STATUS.PLACED,
      farmerId:       null,
      agentId:        null,
      agentName:      null,
      otp:            generateOTP(),
      placedAt:       serverTimestamp(),
      confirmedAt:    null,
      dispatchedAt:   null,
      deliveredAt:    null,
    };

    const ref = await addDoc(collection(db, 'orders'), order);
    return { orderId: ref.id, error: null };
  } catch (err) {
    return { orderId: null, error: err.message };
  }
}

// ── 2. Farmer confirms & accepts order ───────────────────────────────────────
export async function farmerAcceptOrder(orderId, farmerId) {
  try {
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

// ── 3. Mark order as packing ──────────────────────────────────────────────────
export async function markPacking(orderId) {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status: ORDER_STATUS.PACKING,
    });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ── 4. Agent accepts & dispatches ────────────────────────────────────────────
export async function agentDispatchOrder(orderId, agentId, agentName) {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status:       ORDER_STATUS.DISPATCHED,
      agentId,
      agentName,
      dispatchedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ── 5. Confirm delivery with OTP ──────────────────────────────────────────────
export async function confirmDelivery(orderId, enteredOtp) {
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (!snap.exists()) return { error: 'Order not found' };

    const order = snap.data();
    if (order.otp !== enteredOtp) return { error: 'Invalid OTP' };

    await updateDoc(doc(db, 'orders', orderId), {
      status:      ORDER_STATUS.DELIVERED,
      deliveredAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ── 6. Cancel order ───────────────────────────────────────────────────────────
export async function cancelOrder(orderId, reason = '') {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status:           ORDER_STATUS.CANCELLED,
      cancellationNote: reason,
      cancelledAt:      serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ── 7. Get single order ───────────────────────────────────────────────────────
export async function getOrder(orderId) {
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (!snap.exists()) return { order: null, error: 'Not found' };
    return { order: { id: snap.id, ...snap.data() }, error: null };
  } catch (err) {
    return { order: null, error: err.message };
  }
}

// ── 8. Get all orders for a customer ─────────────────────────────────────────
export async function getCustomerOrders(customerId) {
  try {
    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', customerId),
      orderBy('placedAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { orders, error: null };
  } catch (err) {
    return { orders: [], error: err.message };
  }
}

// ── 9. Get pending orders for farmer (real-time) ──────────────────────────────
export function listenFarmerOrders(zone, callback) {
  const q = query(
    collection(db, 'orders'),
    where('zone', '==', zone),
    where('status', 'in', [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PACKING]),
    orderBy('placedAt', 'desc')
  );
  return onSnapshot(q, snap => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

// ── 10. Get dispatched orders for agent (real-time) ───────────────────────────
export function listenAgentOrders(agentId, callback) {
  const q = query(
    collection(db, 'orders'),
    where('agentId', '==', agentId),
    where('status', '==', ORDER_STATUS.DISPATCHED),
  );
  return onSnapshot(q, snap => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

// ── 11. Listen to a single order (customer tracking) ─────────────────────────
export function listenOrder(orderId, callback) {
  return onSnapshot(doc(db, 'orders', orderId), snap => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

// ── 12. Get available orders for agent to pick up ────────────────────────────
export function listenAvailableOrders(zone, callback) {
  const q = query(
    collection(db, 'orders'),
    where('zone', '==', zone),
    where('status', '==', ORDER_STATUS.PACKING),
    where('agentId', '==', null),
    orderBy('placedAt', 'asc')
  );
  return onSnapshot(q, snap => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

// ── Helper: generate 4-digit OTP ─────────────────────────────────────────────
function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}
