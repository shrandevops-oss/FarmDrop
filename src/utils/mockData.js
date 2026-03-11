// ─── FarmDrop Mock Data ────────────────────────────────────────────────────────
// Replace with real API/Firebase calls in production

export const RICE_PRODUCTS = [
  { id: 1, name: 'Ponni Raw',    origin: 'Thanjavur Farms', weight: '25kg', price: 1250, emoji: '🌾', stock: 64 },
  { id: 2, name: 'Sona Masoori', origin: 'Andhra Valley',   weight: '25kg', price: 1100, emoji: '🌾', stock: 38 },
  { id: 3, name: 'Ponni Raw',    origin: 'Thanjavur Farms', weight: '50kg', price: 2300, emoji: '🌾', stock: 22 },
  { id: 4, name: 'Sona Masoori', origin: 'Andhra Valley',   weight: '50kg', price: 2100, emoji: '🌾', stock: 18 },
];

export const ORDER_HISTORY = [
  { id: '#FD-2841', date: 'Mar 8, 2026',  items: '2× Ponni 25kg',  total: 2500, status: 'delivered' },
  { id: '#FD-2790', date: 'Feb 28, 2026', items: '1× Sona 50kg',   total: 2100, status: 'delivered' },
  { id: '#FD-2751', date: 'Feb 18, 2026', items: '3× Ponni 25kg',  total: 3750, status: 'delivered' },
];

export const AGENT_DELIVERIES = [
  { id: '#FD-2840', time: '2:15 PM',  from: 'Muthu Farms, TJ', to: 'Sector 4, Chennai', earn: 85, dist: '6.4 km' },
  { id: '#FD-2835', time: '12:48 PM', from: 'Raju Farms, TJ',  to: 'Anna Nagar',         earn: 72, dist: '5.1 km' },
  { id: '#FD-2829', time: '11:20 AM', from: 'Muthu Farms, TJ', to: 'T Nagar',             earn: 90, dist: '7.8 km' },
  { id: '#FD-2821', time: '9:44 AM',  from: 'Siva Farms, TJ',  to: 'Adyar',              earn: 68, dist: '4.9 km' },
];

export const FARMER_INVENTORY = [
  { name: 'Ponni Raw Rice',  weight: '25kg bags', count: 64, max: 100 },
  { name: 'Sona Masoori',    weight: '25kg bags', count: 38, max: 100 },
  { name: 'Ponni Raw Rice',  weight: '50kg bags', count: 22, max: 50  },
  { name: 'Sona Masoori',    weight: '50kg bags', count: 18, max: 50  },
];

export const DELIVERY_STEPS = [
  { emoji: '✅', label: 'Order Confirmed',  sub: 'Payment received' },
  { emoji: '📦', label: 'Being Packed',     sub: 'Farmer is loading your bags' },
  { emoji: '🛵', label: 'Out for Delivery', sub: 'Agent is on the way' },
  { emoji: '🏠', label: 'Delivered',        sub: 'Enjoy your fresh rice!' },
];
