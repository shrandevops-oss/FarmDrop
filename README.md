# 🌾 FarmDrop

**Farm-to-door rice delivery app** — Fresh 25kg & 50kg rice bags delivered from local farmers to city customers in **30 minutes**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start development server
npm run dev
# → Open http://localhost:3000
```

---

## 📁 Project Structure

```
farmdrop/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── customer/
│   │   │   ├── ShopTab.jsx          # Browse & order rice bags
│   │   │   ├── CustomerTabs.jsx     # Track, Orders, Profile tabs
│   │   │   ├── TrackTab.jsx         # Re-export
│   │   │   ├── OrdersTab.jsx        # Re-export
│   │   │   ├── ProfileTab.jsx       # Re-export
│   │   │   └── PaymentSheet.jsx     # UPI / Card / COD payment
│   │   ├── farmer/                  # (extend here)
│   │   ├── agent/                   # (extend here)
│   │   └── shared/
│   │       ├── LiveMap.jsx          # Animated SVG delivery map
│   │       └── TimerCircle.jsx      # Countdown ring timer
│   ├── context/
│   │   └── AppContext.jsx           # Global state (user, cart, orders)
│   ├── hooks/
│   │   ├── useTimer.js              # Countdown timer hook
│   │   └── useCart.js               # Cart management hook
│   ├── pages/
│   │   ├── AuthPage.jsx             # Login / Sign Up (Customer | Farmer | Agent)
│   │   ├── CustomerApp.jsx          # Customer shell + bottom nav
│   │   ├── FarmerApp.jsx            # Farmer dashboard
│   │   └── AgentApp.jsx             # Delivery agent app
│   ├── utils/
│   │   ├── theme.js                 # Design tokens (colors, fonts)
│   │   └── mockData.js              # Static data (replace with API)
│   ├── App.jsx                      # Router + role-based routing
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles + Google Fonts
├── .env.example                     # Environment variable template
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 👤 User Roles

| Role | Route | Login as |
|------|-------|---------|
| **Customer** | `/` | Select "Customer" on login |
| **Farmer** | `/farmer` | Select "Farmer" on login |
| **Agent** | `/agent` | Select "Agent" on login |

---

## ✨ Features

### Customer
- 🛒 Browse 25kg & 50kg rice bags (Ponni Raw, Sona Masoori)
- 💳 Pay via UPI, Credit/Debit Card, or Cash on Delivery
- 🗺️ Live animated map tracking (farmer → customer)
- ⏱️ 30-minute countdown timer with circular progress
- 📦 Order history with status badges
- 👤 Profile with delivery stats

### Farmer
- 📊 Real-time revenue & order dashboard
- 🔔 Incoming order Accept / Decline
- 📦 Inventory status bars (25kg & 50kg bags)
- 🌾 Farmer-specific branding

### Delivery Agent
- 🟢 Online / Offline toggle
- 🔔 New order popup with auto-decline countdown
- 🗺️ Live delivery map (pickup → drop phases)
- ⏱️ Per-delivery timer
- 🔐 OTP confirmation on delivery
- 💰 Earnings breakdown (Today / Week / Month)
- 📋 Full delivery history
- ⭐ Performance stats (On-Time %, Rating)

---

## 🔧 Adding a Real Backend (Firebase)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add your config to `.env`
3. Install Firebase SDK:
   ```bash
   npm install firebase
   ```
4. Replace `src/utils/mockData.js` calls with Firestore queries
5. Replace `AppContext.jsx` auth with `firebase/auth`

### Recommended Firestore Collections
```
/users/{uid}          — user profile + role
/products/{id}        — rice products & prices
/orders/{orderId}     — order data + status
/inventory/{farmerId} — farmer bag counts
/deliveries/{id}      — agent delivery records
```

---

## 🚢 Deploy to Vercel

```bash
npm run build
npx vercel --prod
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) for auto-deployments.

---

## 📦 Tech Stack

| Tool | Purpose |
|------|---------|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **React Router 6** | Client-side routing |
| **Google Fonts** | Playfair Display + DM Sans + Bebas Neue |

---

## 📄 License

MIT — Built with ❤️ for FarmDrop
