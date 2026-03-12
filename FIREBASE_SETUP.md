# 🔥 FarmDrop Firebase Setup Guide
## Step-by-step — takes about 20 minutes

---

## PART 1 — Create Firebase Project

### Step 1 — Go to Firebase Console
Open: https://console.firebase.google.com
Click **"Add project"**

### Step 2 — Name your project
```
Project name: farmdrop
```
Click **Continue** → Disable Google Analytics (optional) → **Create project**

### Step 3 — Add a Web App
Inside your project:
1. Click the **</>** (Web) icon
2. App nickname: `farmdrop-web`
3. Click **Register app**
4. You'll see a config object like this — **COPY IT**:
```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "farmdrop.firebaseapp.com",
  projectId:         "farmdrop",
  storageBucket:     "farmdrop.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

---

## PART 2 — Enable Authentication

### Step 4 — Open Authentication
In Firebase Console sidebar → **Authentication** → **Get started**

### Step 5 — Enable Email/Password
Click **Sign-in method** tab → **Email/Password** → Toggle **Enable** → **Save**

### Step 6 — Enable Google
Click **Add new provider** → **Google** → Toggle **Enable**
Set **Project support email** (your email) → **Save**

### Step 7 — Enable Phone OTP
Click **Add new provider** → **Phone** → Toggle **Enable** → **Save**

⚠️ Phone auth requires your app to be on a real domain (not localhost).
For testing, add your number to **"Phone numbers for testing"** section.

---

## PART 3 — Create Firestore Database

### Step 8 — Open Firestore
Sidebar → **Firestore Database** → **Create database**

### Step 9 — Choose mode
Select **"Start in test mode"** → **Next**
Choose region: **asia-south1 (Mumbai)** → **Enable**

### Step 10 — Set Security Rules
Click **Rules** tab → Replace everything with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // agents/farmers can see customer info
    }

    // Orders — customers create, farmers/agents update
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null;
    }

    // Inventory — farmers manage their own
    match /inventory/{farmerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == farmerId;
    }

    // Deliveries — agents manage their own
    match /deliveries/{deliveryId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
Click **Publish**

---

## PART 4 — Add Authorized Domain

### Step 11 — Add your Render domain
Authentication → **Settings** tab → **Authorized domains**
Click **Add domain** → Enter your Render URL:
```
farmdrop.onrender.com
```
Click **Add**

---

## PART 5 — Add Keys to your Project

### Step 12 — Create .env file
In your farmdrop folder, create a file called `.env`
(copy from `.env.example` and fill in your values):

```
VITE_FIREBASE_API_KEY=AIzaSy_YOUR_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 13 — Add keys to Render
Render Dashboard → Your Site → **Environment** tab
Add each variable from your .env file:

| Key | Value |
|-----|-------|
| VITE_FIREBASE_API_KEY | AIzaSy... |
| VITE_FIREBASE_AUTH_DOMAIN | your-project.firebaseapp.com |
| VITE_FIREBASE_PROJECT_ID | your-project |
| VITE_FIREBASE_STORAGE_BUCKET | your-project.appspot.com |
| VITE_FIREBASE_MESSAGING_SENDER_ID | 123... |
| VITE_FIREBASE_APP_ID | 1:123...:web:abc... |

Click **Save Changes** → Render will auto-redeploy ✅

---

## PART 6 — Push Code to GitHub

### Step 14 — Upload new files
Your project now has a new `src/firebase/` folder with 4 files:
- `config.js`
- `auth.js`
- `orders.js`
- `inventory.js`
- `deliveries.js`

Using GitHub Desktop:
1. Open GitHub Desktop
2. You'll see all changed files listed
3. Type commit message: `Add Firebase integration`
4. Click **Commit to main**
5. Click **Push origin**

Render auto-redeploys in ~2 minutes ✅

---

## ✅ Test Checklist

After deploy, test these in order:

- [ ] Open your Render URL
- [ ] Click Sign Up → Email → create account → should redirect to app
- [ ] Click Sign Up → Google → should open Google popup
- [ ] Place an order → check Firestore Console → orders collection should show it
- [ ] Login as Farmer → should see the order appear in real-time
- [ ] Login as Agent → accept delivery → complete with OTP

---

## 🆘 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `auth/unauthorized-domain` | Add your domain in Firebase Auth → Settings → Authorized domains |
| `auth/operation-not-allowed` | Enable the sign-in method in Firebase Console |
| `Missing Firebase config` | Check your .env file has all 6 VITE_ variables |
| `Firestore permission denied` | Check your Firestore security rules are published |
| Google popup blocked | Allow popups for your site in browser settings |

---

## 💡 Firestore Collections Created Automatically

| Collection | Created when |
|------------|-------------|
| `users` | First login |
| `orders` | Customer places order |
| `inventory` | Farmer logs in first time |
| `deliveries` | Agent accepts a delivery |

No manual setup needed — they're created on first use! 🌾
