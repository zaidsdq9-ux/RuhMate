import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserSessionPersistence,
  setPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Auth state lives only for the current browser session. Closing the browser
// clears it (sessionStorage), so the user must authenticate again on the next
// launch — by design. A page refresh within the same session keeps them in.
// Sign-in flows also await `setSessionPersistence()` so the mode is guaranteed
// to be applied before the credential is created.
if (typeof window !== 'undefined') {
  void setPersistence(auth, browserSessionPersistence).catch(() => {
    // Non-fatal: if persistence can't be set (private mode quirks) Firebase
    // falls back to in-memory, which is still session-scoped.
  });
}

/** Ensure auth uses session-only persistence. Await before any sign-in call. */
export async function setSessionPersistence(): Promise<void> {
  await setPersistence(auth, browserSessionPersistence);
}

export { app };
