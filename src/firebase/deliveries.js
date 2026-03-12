// ─── src/firebase/deliveries.js ──────────────────────────────────────────────
// Agent delivery records, earnings, performance stats

import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot, serverTimestamp,
  limit, Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// ── 1. Create a delivery record when agent accepts ────────────────────────────
export async function createDelivery({ orderId, agentId, agentName, farmerId, farmerName, farmerAddress, customerId, customerName, customerAddress, zone, total }) {
  try {
    const earning = calculateEarning(total);
    const ref = await addDoc(collection(db, 'deliveries'), {
      orderId,
      agentId,
      agentName,
      farmerId,
      farmerName,
      farmerAddress,
      customerId,
      customerName,
      customerAddress,
      zone,
      orderTotal:  total,
      earning,
      status:      'active',   // active | completed | failed
      startedAt:   serverTimestamp(),
      completedAt: null,
    });
    return { deliveryId: ref.id, earning, error: null };
  } catch (err) {
    return { deliveryId: null, earning: 0, error: err.message };
  }
}

// ── 2. Complete a delivery ────────────────────────────────────────────────────
export async function completeDelivery(deliveryId) {
  try {
    await updateDoc(doc(db, 'deliveries', deliveryId), {
      status:      'completed',
      completedAt: serverTimestamp(),
    });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ── 3. Get agent earnings for today ──────────────────────────────────────────
export async function getTodayEarnings(agentId) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'deliveries'),
      where('agentId',   '==', agentId),
      where('status',    '==', 'completed'),
      where('startedAt', '>=', Timestamp.fromDate(startOfDay)),
      orderBy('startedAt', 'desc')
    );

    const snap = await getDocs(q);
    const deliveries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const total = deliveries.reduce((s, d) => s + d.earning, 0);

    return { deliveries, total, count: deliveries.length, error: null };
  } catch (err) {
    return { deliveries: [], total: 0, count: 0, error: err.message };
  }
}

// ── 4. Get agent earnings for this week ───────────────────────────────────────
export async function getWeekEarnings(agentId) {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'deliveries'),
      where('agentId',   '==', agentId),
      where('status',    '==', 'completed'),
      where('startedAt', '>=', Timestamp.fromDate(startOfWeek)),
      orderBy('startedAt', 'desc')
    );

    const snap = await getDocs(q);
    const deliveries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const total = deliveries.reduce((s, d) => s + d.earning, 0);

    return { deliveries, total, count: deliveries.length, error: null };
  } catch (err) {
    return { deliveries: [], total: 0, count: 0, error: err.message };
  }
}

// ── 5. Get all-time delivery history for agent ────────────────────────────────
export async function getAgentHistory(agentId, limitCount = 20) {
  try {
    const q = query(
      collection(db, 'deliveries'),
      where('agentId', '==', agentId),
      orderBy('startedAt', 'desc'),
      limit(limitCount)
    );

    const snap = await getDocs(q);
    const deliveries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const totalEarned = deliveries
      .filter(d => d.status === 'completed')
      .reduce((s, d) => s + d.earning, 0);

    return { deliveries, totalEarned, error: null };
  } catch (err) {
    return { deliveries: [], totalEarned: 0, error: err.message };
  }
}

// ── 6. Listen to agent's active delivery (real-time) ─────────────────────────
export function listenActiveDelivery(agentId, callback) {
  const q = query(
    collection(db, 'deliveries'),
    where('agentId', '==', agentId),
    where('status',  '==', 'active'),
    limit(1)
  );
  return onSnapshot(q, snap => {
    if (!snap.empty) {
      callback({ id: snap.docs[0].id, ...snap.docs[0].data() });
    } else {
      callback(null);
    }
  });
}

// ── 7. Get agent performance stats ───────────────────────────────────────────
export async function getAgentStats(agentId) {
  try {
    const q = query(
      collection(db, 'deliveries'),
      where('agentId', '==', agentId),
    );
    const snap = await getDocs(q);
    const all = snap.docs.map(d => d.data());

    const completed  = all.filter(d => d.status === 'completed').length;
    const failed     = all.filter(d => d.status === 'failed').length;
    const total      = all.length;
    const onTimeRate = total > 0 ? Math.round((completed / total) * 100) : 100;
    const totalEarned = all.filter(d => d.status === 'completed').reduce((s, d) => s + d.earning, 0);

    return { completed, failed, total, onTimeRate, totalEarned, error: null };
  } catch (err) {
    return { completed: 0, failed: 0, total: 0, onTimeRate: 0, totalEarned: 0, error: err.message };
  }
}

// ── Helper: calculate agent earning per delivery ──────────────────────────────
function calculateEarning(orderTotal) {
  // Base ₹50 + 5% of order value, max ₹120
  const earning = 50 + Math.floor(orderTotal * 0.05);
  return Math.min(earning, 120);
}
