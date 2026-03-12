// ─── src/firebase/auth.js ─────────────────────────────────────────────────────
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

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// FIX: recaptchaVerifier kept as module-level variable
// so it is not recreated on every call (fixes "already rendered" crash)
let recaptchaVerifier = null;

export async function ensureUserProfile(firebaseUser, extraData = {}) {
  const ref  = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:       firebaseUser.uid,
      name:      firebaseUser.displayName || extraData.name || 'FarmDrop User',
      email:     firebaseUser.email       || '',
      phone:     firebaseUser.phoneNumber || extraData.phone || '',
      role:      extraData.role           || 'customer',
      zone:      extraData.zone           || 'Zone 3',
      address:   extraData.address        || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  const fresh = await getDoc(ref);
  return fresh.data();
}

// 1. Email Sign Up
export async function signUpEmail({ name, email, password, role, phone }) {
  try {
    // FIX: validate inputs before hitting Firebase
    if (!name?.trim())     return { user: null, error: 'Please enter your name.' };
    if (!email?.trim())    return { user: null, error: 'Please enter your email.' };
    if (!password || password.length < 6) return { user: null, error: 'Password must be at least 6 characters.' };

    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    const profile = await ensureUserProfile(cred.user, { name: name.trim(), role, phone });
    return { user: { uid: cred.user.uid, email: cred.user.email, ...profile }, error: null };
  } catch (err) {
    return { user: null, error: friendlyError(err.code) };
  }
}

// 2. Email Login
export async function loginEmail({ email, password }) {
  try {
    if (!email?.trim())  return { user: null, error: 'Please enter your email.' };
    if (!password)       return { user: null, error: 'Please enter your password.' };

    const cred    = await signInWithEmailAndPassword(auth, email.trim(), password);
    const profile = await ensureUserProfile(cred.user);
    return { user: { uid: cred.user.uid, email: cred.user.email, ...profile }, error: null };
  } catch (err) {
    return { user: null, error: friendlyError(err.code) };
  }
}

// 3. Google
export async function loginGoogle(role = 'customer') {
  try {
    const cred    = await signInWithPopup(auth, googleProvider);
    const profile = await ensureUserProfile(cred.user, { role });
    return { user: { uid: cred.user.uid, email: cred.user.email, ...profile }, error: null };
  } catch (err) {
    return { user: null, error: friendlyError(err.code) };
  }
}

// 4. Phone OTP — send
export async function sendPhoneOTP(phoneNumber, recaptchaContainerId) {
  try {
    if (!phoneNumber || phoneNumber.replace(/\D/g,'').length < 10)
      return { confirmation: null, error: 'Please enter a valid phone number.' };

    // FIX: clear old verifier before creating new one
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
    recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });

    const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return { confirmation, error: null };
  } catch (err) {
    recaptchaVerifier = null;
    return { confirmation: null, error: friendlyError(err.code) };
  }
}

// 5. Phone OTP — verify
export async function verifyPhoneOTP(confirmationResult, otp, role = 'customer') {
  try {
    if (!otp || otp.trim().length < 4)
      return { user: null, error: 'Please enter the OTP.' };
    if (!confirmationResult)
      return { user: null, error: 'Session expired. Please request a new OTP.' };

    const cred    = await confirmationResult.confirm(otp.trim());
    const profile = await ensureUserProfile(cred.user, { role });
    return { user: { uid: cred.user.uid, ...profile }, error: null };
  } catch (err) {
    return { user: null, error: friendlyError(err.code) };
  }
}

// 6. Logout
export async function logout() {
  try {
    recaptchaVerifier = null;
    await signOut(auth);
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

// 7. Auth state listener
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const profile = await ensureUserProfile(firebaseUser);
        callback({ uid: firebaseUser.uid, email: firebaseUser.email, ...profile });
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':      'This email is already registered. Try logging in.',
    'auth/wrong-password':            'Incorrect password. Please try again.',
    'auth/invalid-credential':        'Incorrect email or password. Please try again.',
    'auth/user-not-found':            'No account found with this email.',
    'auth/invalid-email':             'Please enter a valid email address.',
    'auth/weak-password':             'Password must be at least 6 characters.',
    'auth/too-many-requests':         'Too many attempts. Please wait a few minutes.',
    'auth/invalid-verification-code': 'Invalid OTP. Please check and try again.',
    'auth/code-expired':              'OTP has expired. Please request a new one.',
    'auth/popup-closed-by-user':      'Google sign-in was cancelled.',
    'auth/network-request-failed':    'Network error. Please check your connection.',
    'auth/user-disabled':             'This account has been disabled. Contact support.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
