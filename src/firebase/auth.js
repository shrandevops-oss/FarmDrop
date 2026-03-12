// ─── src/firebase/auth.js ─────────────────────────────────────────────────────
// Handles: Email/Password, Google Sign-In, Phone OTP
// All functions return { user, error }

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// ── Google provider ────────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ── Helper: create/fetch user profile in Firestore ────────────────────────────
export async function ensureUserProfile(firebaseUser, extraData = {}) {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // First time — create profile
    await setDoc(ref, {
      uid:       firebaseUser.uid,
      name:      firebaseUser.displayName || extraData.name || 'FarmDrop User',
      email:     firebaseUser.email || '',
      phone:     firebaseUser.phoneNumber || extraData.phone || '',
      role:      extraData.role || 'customer',   // customer | farmer | agent
      zone:      extraData.zone || 'Zone 3',
      address:   extraData.address || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const updated = await getDoc(ref);
  return updated.data();
}

// ── 1. Email / Password — Sign Up ─────────────────────────────────────────────
export async function signUpEmail({ name, email, password, role, phone }) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile = await ensureUserProfile(cred.user, { name, role, phone });
    return { user: { ...cred.user, ...profile }, error: null };
  } catch (err) {
    return { user: null, error: friendlyError(err.code) };
  }
}

// ── 2. Email / Password — Login ───────────────────────────────────────────────
export async function loginEmail({ email, password }) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await ensureUserProfile(cred.user);
    return { user: { ...cred.user, ...profile }, error: null };
  } catch (err) {
    return { user: null, error: friendlyError(err.code) };
  }
}

// ── 3. Google Sign-In ─────────────────────────────────────────────────────────
export async function loginGoogle(role = 'customer') {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const profile = await ensureUserProfile(cred.user, { role });
    return { user: { ...cred.user, ...profile }, error: null };
  } catch (err) {
    return { user: null, error: friendlyError(err.code) };
  }
}

// ── 4. Phone OTP — Step 1: Send OTP ──────────────────────────────────────────
export async function sendPhoneOTP(phoneNumber, recaptchaContainerId) {
  try {
    // phoneNumber format: +91XXXXXXXXXX
    const recaptcha = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
      callback: () => {},
    });
    const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
    return { confirmation, error: null };
  } catch (err) {
    return { confirmation: null, error: friendlyError(err.code) };
  }
}

// ── 5. Phone OTP — Step 2: Verify OTP ────────────────────────────────────────
export async function verifyPhoneOTP(confirmationResult, otp, role = 'customer') {
  try {
    const cred = await confirmationResult.confirm(otp);
    const profile = await ensureUserProfile(cred.user, { role });
    return { user: { ...cred.user, ...profile }, error: null };
  } catch (err) {
    return { user: null, error: friendlyError(err.code) };
  }
}

// ── 6. Logout ─────────────────────────────────────────────────────────────────
export async function logout() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// ── 7. Auth state listener (use in AppContext) ────────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await ensureUserProfile(firebaseUser);
      callback({ ...firebaseUser, ...profile });
    } else {
      callback(null);
    }
  });
}

// ── Friendly error messages ───────────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':    'This email is already registered. Try logging in.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/weak-password':           'Password must be at least 6 characters.',
    'auth/too-many-requests':       'Too many attempts. Please wait a moment.',
    'auth/invalid-verification-code': 'Invalid OTP. Please check and try again.',
    'auth/code-expired':            'OTP expired. Please request a new one.',
    'auth/popup-closed-by-user':    'Google sign-in was cancelled.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
