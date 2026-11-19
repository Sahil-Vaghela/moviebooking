import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './client';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function mapAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Please allow popups for this site and retry.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in this Firebase project. Enable it in Firebase Console → Authentication → Sign-in method, or continue with Google sign-in.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error while reaching Firebase Authentication. Check your connection and retry.';
    default:
      return error instanceof Error
        ? error.message
        : 'Unable to complete authentication. Please try again.';
  }
}

export const authService = {
  async signInWithEmail(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  },

  async registerWithEmail(params: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<User> {
    const credential = await createUserWithEmailAndPassword(
      auth,
      params.email.trim(),
      params.password
    );
    await updateProfile(credential.user, {
      displayName: params.displayName.trim().slice(0, 80),
    });
    try {
      await sendEmailVerification(credential.user);
    } catch {
      // Verification email dispatch is best-effort; user can resend from Profile
    }
    return credential.user;
  },

  async signInWithGoogle(): Promise<User> {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential.user;
  },

  async resendVerificationEmail(user: User): Promise<void> {
    await sendEmailVerification(user);
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },
};
