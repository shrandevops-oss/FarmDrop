// ─── src/firebase/inventory.js ───────────────────────────────────────────────
// Farmer inventory: read, update stock, listen for real-time changes

import {
  doc, collection, getDocs, getDoc,
  setDoc, updateDoc, onSnapshot,
  query, where, serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './config';

// ── Default inventory template for new farmers ────────────────────────────────
const DEFAULT_INVENTORY = [
  { productId: 'ponni-25',  name: 'Ponni Raw Rice',  weight: '25kg', price: 1250, stock: 0, maxStock: 100 },
  { productId: 'sona-25',   name: 'Sona Masoori',    weight: '25kg', price: 1100, stock: 0, maxStock: 100 },
  { productId: 'ponni-50',  name: 'Ponni Raw Rice',  weight: '50kg', price: 2300, stock: 0, maxStock: 50  },
  { productId: 'sona-50',   name: 'Sona Masoori',    weight: '50kg', price: 2100, stock: 0, maxStock: 50  },
];

// ── 1. Initialize inventory for a new farmer ──────────────────────────────────
export async function initFarmerInventory(farmerId) {
  try {
    const ref = doc(db, 'inventory', farmerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        farmerId,
        products:  DEFAULT_INVENTORY,
        updatedAt: serverTimestamp(),
      });
    }
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ── 2. Get farmer inventory (one-time fetch) ──────────────────────────────────
export async function getFarmerInventory(farmerId) {
  try {
    const snap = await getDoc(doc(db, 'inventory', farmerId));
    if (!snap.exists()) return { inventory: DEFAULT_INVENTORY, error: null };
    return { inventory: snap.data().products, error: null };
  } catch (err) {
    return { inventory: [], error: err.message };
  }
}

// ── 3. Listen to farmer inventory (real-time) ────────────────────────────────
export function listenFarmerInventory(farmerId, callback) {
  return onSnapshot(doc(db, 'inventory', farmerId), snap => {
    if (snap.exists()) {
      callback(snap.data().products);
    } else {
      callback(DEFAULT_INVENTORY);
    }
  });
}

// ── 4. Update stock for a product ─────────────────────────────────────────────
export async function updateStock(farmerId, productId, newStock) {
  try {
    const ref  = doc(db, 'inventory', farmerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { error: 'Inventory not found' };

    const products = snap.data().products.map(p =>
      p.productId === productId ? { ...p, stock: Math.max(0, newStock) } : p
    );

    await updateDoc(ref, { products, updatedAt: serverTimestamp() });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ── 5. Deduct stock when order is placed ──────────────────────────────────────
export async function deductStock(farmerId, orderItems) {
  try {
    const ref  = doc(db, 'inventory', farmerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { error: 'Inventory not found' };

    const products = snap.data().products.map(product => {
      const ordered = orderItems.find(i => i.productId === product.productId);
      if (ordered) {
        return { ...product, stock: Math.max(0, product.stock - ordered.qty) };
      }
      return product;
    });

    await updateDoc(ref, { products, updatedAt: serverTimestamp() });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ── 6. Get all available products across all farmers in a zone ────────────────
export async function getAvailableProducts(zone) {
  try {
    const usersQ  = query(collection(db, 'users'), where('role', '==', 'farmer'), where('zone', '==', zone));
    const farmers = await getDocs(usersQ);

    const allProducts = [];
    for (const farmer of farmers.docs) {
      const inv = await getFarmerInventory(farmer.id);
      inv.inventory
        .filter(p => p.stock > 0)
        .forEach(p => allProducts.push({ ...p, farmerId: farmer.id, farmerName: farmer.data().name }));
    }
    return { products: allProducts, error: null };
  } catch (err) {
    return { products: [], error: err.message };
  }
}
