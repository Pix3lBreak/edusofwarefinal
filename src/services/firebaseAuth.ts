/**
 * Firebase Authentication & Automated Profile Synchronization Service
 * Handles real Google Sign-In, Firestore user profile persistence, and session management.
 */

import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  User as FirebaseUser,
  onAuthStateChanged,
  Unsubscribe
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  disableNetwork
} from 'firebase/firestore';
import { auth, db, googleAuthProvider, handleFirestoreError, OperationType, reconnectFirestoreNetwork } from '../lib/firebase';
import { UserAccount, UserRole } from '../types';

export interface AuthResult {
  success: boolean;
  user?: UserAccount;
  firebaseUser?: FirebaseUser;
  message?: string;
  isNewUser?: boolean;
}

/**
 * Sign in with Google using Firebase Authentication Popup.
 * Automatically fetches or creates a user profile in Firestore under /users/{uid}.
 */
export async function signInWithGoogleFirebase(): Promise<AuthResult> {
  try {
    try {
      await reconnectFirestoreNetwork();
    } catch {
      // ignore
    }
    const credential = await signInWithPopup(auth, googleAuthProvider);
    const fbUser = credential.user;

    if (!fbUser || !fbUser.email) {
      return {
        success: false,
        message: 'No se pudo obtener la información de la cuenta Google.'
      };
    }

    // Synchronize or create profile in Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    let userProfile: UserAccount;
    let isNewUser = false;

    try {
      const docSnap = await getDoc(userDocRef);
      const now = new Date().toISOString();

      if (docSnap.exists()) {
        const data = docSnap.data() as UserAccount;
        userProfile = {
          ...data,
          lastLogin: now,
          googlePicture: fbUser.photoURL || data.googlePicture || data.avatarUrl,
          avatarUrl: fbUser.photoURL || data.avatarUrl,
          emailVerified: fbUser.emailVerified,
          isGoogleLinked: true,
        };

        // Update last login in Firestore
        await updateDoc(userDocRef, {
          lastLogin: now,
          googlePicture: userProfile.googlePicture || '',
          avatarUrl: userProfile.avatarUrl || '',
          emailVerified: fbUser.emailVerified,
          isGoogleLinked: true,
        });
      } else {
        // Automatic profile creation for new Google user
        isNewUser = true;

        // Assign Superadmin ONLY if email matches pixelglez1988@gmail.com
        const isSuperAdmin = fbUser.email.toLowerCase() === 'pixelglez1988@gmail.com';
        const initialRole: UserRole = isSuperAdmin ? 'superadmin' : 'estudiante';
        const initialStatus: 'activo' | 'pendiente' = isSuperAdmin ? 'activo' : 'pendiente';

        userProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          role: initialRole,
          status: initialStatus,
          avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fbUser.displayName || fbUser.email)}`,
          googlePicture: fbUser.photoURL || undefined,
          isGoogleLinked: true,
          googleSub: fbUser.providerData?.[0]?.uid || fbUser.uid,
          emailVerified: fbUser.emailVerified,
          lastLogin: now,
        };

        await setDoc(userDocRef, {
          ...userProfile,
          createdAt: now,
        });
      }

      return {
        success: true,
        user: userProfile,
        firebaseUser: fbUser,
        isNewUser,
        message: userProfile.status === 'pendiente'
          ? 'Cuenta registrada en espera de activación por el Superadministrador.'
          : 'Sesión iniciada con Google'
      };
    } catch (firestoreErr) {
      console.warn('Firestore profile sync fallback (local-first):', firestoreErr);
      try {
        await disableNetwork(db);
      } catch {
        // ignore
      }
      
      const isSuperAdmin = fbUser.email.toLowerCase() === 'pixelglez1988@gmail.com';
      const fallbackRole: UserRole = isSuperAdmin ? 'superadmin' : 'estudiante';
      const fallbackStatus = isSuperAdmin ? 'activo' : 'pendiente';

      const fallbackProfile: UserAccount = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        email: fbUser.email,
        role: fallbackRole,
        status: fallbackStatus,
        avatarUrl: fbUser.photoURL || undefined,
        googlePicture: fbUser.photoURL || undefined,
        isGoogleLinked: true,
        emailVerified: fbUser.emailVerified,
        lastLogin: new Date().toISOString(),
      };

      return {
        success: true,
        user: fallbackProfile,
        firebaseUser: fbUser,
        isNewUser: false,
        message: fallbackProfile.status === 'pendiente' 
          ? 'Cuenta registrada en espera de activación por el Superadministrador.' 
          : 'Sesión iniciada correctamente'
      };
    }
  } catch (error: any) {
    console.error('Firebase Google Sign-In Error:', error);
    
    if (error.code === 'auth/popup-blocked') {
      return {
        success: false,
        message: 'La ventana emergente de Google fue bloqueada por el navegador. Por favor permite las ventanas emergentes o utiliza el selector de acceso rápido.'
      };
    }
    if (error.code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        message: 'El inicio de sesión fue cancelado por el usuario.'
      };
    }
    if (error.code === 'auth/cancelled-popup-request') {
      return {
        success: false,
        message: 'Operación cancelada debido a otra solicitud activa.'
      };
    }

    return {
      success: false,
      message: error.message || 'Error al conectar con los servicios de Google Firebase.'
    };
  }
}

/**
 * Sign out from Firebase Auth
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Error signing out from Firebase:', err);
  }
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfileFirestore(userId: string, updates: Partial<UserAccount>): Promise<boolean> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    return true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes('token-service-api') ||
      msg.includes('securetoken') ||
      msg.includes('offline') ||
      msg.includes('unavailable') ||
      msg.includes('network')
    ) {
      console.warn('Actualización remota en Firestore postergada (modo offline):', msg);
      return false;
    }
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
}

/**
 * Listen for Firebase Auth changes
 */
export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
