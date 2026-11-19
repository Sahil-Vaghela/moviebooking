import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore, type Firestore } from 'firebase/firestore';
import provisionedConfig from '../../../firebase-applet-config.json';

interface FirebaseRuntimeConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

function resolveEnv(key: string): string | undefined {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (!value || value.startsWith('YOUR_') || value === 'MY_') {
    return undefined;
  }
  return value;
}

const runtimeConfig: FirebaseRuntimeConfig = {
  apiKey: resolveEnv('VITE_FIREBASE_API_KEY') ?? provisionedConfig.apiKey,
  authDomain: resolveEnv('VITE_FIREBASE_AUTH_DOMAIN') ?? provisionedConfig.authDomain,
  projectId: resolveEnv('VITE_FIREBASE_PROJECT_ID') ?? provisionedConfig.projectId,
  storageBucket: resolveEnv('VITE_FIREBASE_STORAGE_BUCKET') ?? provisionedConfig.storageBucket,
  messagingSenderId:
    resolveEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') ?? provisionedConfig.messagingSenderId,
  appId: resolveEnv('VITE_FIREBASE_APP_ID') ?? provisionedConfig.appId,
  firestoreDatabaseId:
    resolveEnv('VITE_FIREBASE_DATABASE_ID') ?? provisionedConfig.firestoreDatabaseId,
};

export const isFirebaseConfigured = Boolean(
  runtimeConfig.apiKey && runtimeConfig.projectId && runtimeConfig.appId
);

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApps()[0] : initializeApp(runtimeConfig);

export const auth: Auth = getAuth(firebaseApp);

export const db: Firestore = runtimeConfig.firestoreDatabaseId
  ? getFirestore(firebaseApp, runtimeConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

async function testConnection(): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. Firestore client appears offline.');
    }
  }
}

void testConnection();
