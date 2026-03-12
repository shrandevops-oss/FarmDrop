// ─── src/firebase/inventory.js ───────────────────────────────────────────────
import {
  doc, collection, getDocs, getDoc,
  setDoc, updateDoc, onSnapshot,
  query, where, serverTimestamp,
  // FIX: removed unused 'increment' import
} from 'firebase/firestore';
import { db } from './config';

const DEFAULT_INVENTORY = [
  { productId: 'ponni-25',  name: 'Ponni Raw Rice',  weight: '25kg', price: 1250, stock: 0, maxStock: 100 },
  { productId: 'sona-25',   name: 'Sona Masoori',    weight: '25kg', price: 1100, stock: 0, maxStock: 100 },
  { productId: 'ponni-50',  name: 'Ponni Raw Rice',  weight: '50kg', price: 2300, stock: 0, maxStock: 50  },
  { productId: 'sona-50',   name: 'Sona Masoori',    weight: '50kg', price: 2100, stock: 0, maxStock: 50  },
];

// 1. Init inventory for new farmer
export async function initFarmerInventory(farmerId) {
  try {
    if (!farmerId) return { error: 'Missing farmerId.' };
    const ref  = doc(db, 'inventory', farmerId);
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

// 2. Get inventory (one-time)
export async function getFarmerInventory(farmerId) {
  try {
    if (!farmerId) return { inventory: DEFAULT_INVENTORY, error: null };
    const snap = await getDoc(doc(db, 'inventory', farmerId));
    if (!snap.exists()) return { inventory: DEFAULT_INVENTORY, error: null };
    return { inventory: snap.data().products || DEFAULT_INVENTORY, error: null };
  } catch (err) {
    return { inventory: DEFAULT_INVENTORY, error: err.message };
  }
}

// 3. Listen inventory (real-time)
export function listenFarmerInventory(farmerId, callback) {
  if (!farmerId) { callback(DEFAULT_INVENTORY); return () => {}; }
  return onSnapshot(doc(db, 'inventory', farmerId), snap => {
    callback(snap.exists() ? (snap.data().products || DEFAULT_INVENTORY) : DEFAULT_INVENTORY);
  });
}

// 4. Update stock
export async function updateStock(farmerId, productId, newStock) {
  try {
    if (!farmerId || !productId) return { error: 'Missing farmerId or productId.' };
    if (typeof newStock !== 'number' || newStock < 0) return { error: 'Invalid stock value.' };

    const ref  = doc(db, 'inventory', farmerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { error: 'Inventory not found.' };

    const products = (snap.data().products || DEFAULT_INVENTORY).map(p =>
      p.productId === productId ? { ...p, stock: Math.max(0, newStock) } : p
    );
    await updateDoc(ref, { products, updatedAt: serverTimestamp() });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// 5. Deduct stock when order placed
export async function deductStock(farmerId, orderItems) {
  try {
    if (!farmerId)        return { error: 'Missing farmerId.' };
    if (!orderItems?.length) return { error: 'No items to deduct.' };

    const ref  = doc(db, 'inventory', farmerId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { error: 'Inventory not found.' };

    const products = (snap.data().products || DEFAULT_INVENTORY).map(product => {
      const ordered = orderItems.find(i => i.productId === product.productId);
      if (ordered) {
        const newStock = product.stock - ordered.qty;
        // FIX: prevent negative stock
        if (newStock < 0) throw new Error(`Not enough stock for ${product.name}.`);
        return { ...product, stock: newStock };
      }
      return product;
    });

    await updateDoc(ref, { products, updatedAt: serverTimestamp() });
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// 6. Get products across all farmers in a zone
export async function getAvailableProducts(zone) {
  try {
    if (!zone) return { products: [], error: 'Missing zone.' };
    const usersQ  = query(collection(db, 'users'), where('role', '==', 'farmer'), where('zone', '==', zone));
    const farmers = await getDocs(usersQ);

    const allProducts = [];
    for (const farmer of farmers.docs) {
      const { inventory } = await getFarmerInventory(farmer.id);
      inventory
        .filter(p => p.stock > 0)
        .forEach(p => allProducts.push({ ...p, farmerId: farmer.id, farmerName: farmer.data().name || '' }));
    }
    return { products: allProducts, error: null };
  } catch (err) {
    return { products: [], error: err.message };
  }
}
