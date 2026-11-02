import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, disableNetwork, enableNetwork } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId as specified in config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

let isNetworkDisabled = true;

// Proactively disable remote network to prevent token-service-api-has-not-been-used errors
disableNetwork(db).catch(() => {});

// Initialize Auth
export const auth = getAuth(app);

// Google Auth Provider
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account'
});

// Operation Types for error tracking
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}



// Test initial connection to Firestore with graceful offline handling
export async function validateFirestoreConnection(): Promise<boolean> {
  if (isNetworkDisabled) {
    return false;
  }

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes('the client is offline') ||
      msg.includes('token-service-api') ||
      msg.includes('securetoken.googleapis.com') ||
      msg.includes('unavailable') ||
      msg.includes('failed-precondition') ||
      msg.includes('Could not reach Cloud Firestore backend') ||
      msg.includes('Fetching auth token failed')
    ) {
      console.info('Firebase Firestore: modo local activado. Deteniendo reintentos de red remota.');
      try {
        isNetworkDisabled = true;
        await disableNetwork(db);
      } catch {
        // Ignore if already disabled
      }
      return false;
    }
    // Document might not exist or rules deny, but connection is reached
    return true;
  }
}

export async function reconnectFirestoreNetwork(): Promise<boolean> {
  try {
    isNetworkDisabled = false;
    await enableNetwork(db);
    return true;
  } catch {
    return false;
  }
}


