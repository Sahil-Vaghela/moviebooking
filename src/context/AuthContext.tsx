import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../services/firebase/client';
import { authService } from '../services/firebase/authService';
import { usersRepository } from '../services/firebase/usersRepository';
import { useCity } from './CityContext';
import type { AuthProviderKind, UserProfile, UserProfileUpdateInput } from '../types/user';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  profileLoading: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
  saveProfile: (input: UserProfileUpdateInput) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  registerWithEmail: (params: {
    displayName: string;
    email: string;
    password: string;
  }) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function resolveProviderKind(user: User): AuthProviderKind {
  const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
  return isGoogle ? 'google.com' : 'password';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { selectedCity } = useCity();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadOrBootstrapProfile = useCallback(
    async (firebaseUser: User) => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        let existing = await usersRepository.getById(firebaseUser.uid);

        if (!existing && firebaseUser.emailVerified && firebaseUser.email) {
          await usersRepository.createProfile({
            uid: firebaseUser.uid,
            displayName:
              firebaseUser.displayName ||
              firebaseUser.email.split('@')[0] ||
              'Marquee Member',
            email: firebaseUser.email,
            preferredCityId: selectedCity.id,
            authProvider: resolveProviderKind(firebaseUser),
            preferredLanguages: ['Hindi', 'English'],
          });
          existing = await usersRepository.getById(firebaseUser.uid);
        }

        setProfile(existing);
      } catch (err) {
        setProfileError(
          err instanceof Error ? err.message : 'Unable to load your profile from Firestore.'
        );
      } finally {
        setProfileLoading(false);
      }
    },
    [selectedCity.id]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);

      if (!firebaseUser) {
        setProfile(null);
        setProfileError(null);
        setProfileLoading(false);
        return;
      }

      void loadOrBootstrapProfile(firebaseUser);
    });

    return () => unsubscribe();
  }, [loadOrBootstrapProfile]);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setUser(auth.currentUser);
    await loadOrBootstrapProfile(auth.currentUser);
  }, [loadOrBootstrapProfile]);

  const saveProfile = useCallback(
    async (input: UserProfileUpdateInput) => {
      if (!auth.currentUser) {
        throw new Error('You must be signed in to update your profile.');
      }
      if (!auth.currentUser.emailVerified) {
        throw new Error(
          'Please verify your email address before saving profile updates to Firestore.'
        );
      }

      const existing = await usersRepository.getById(auth.currentUser.uid);
      if (!existing) {
        await usersRepository.createProfile({
          uid: auth.currentUser.uid,
          displayName: input.displayName,
          email: auth.currentUser.email ?? '',
          phone: input.phone,
          preferredCityId: input.preferredCityId,
          preferredLanguages: input.preferredLanguages,
          authProvider: resolveProviderKind(auth.currentUser),
        });
      } else {
        await usersRepository.updateProfile(auth.currentUser.uid, input);
      }
      const updated = await usersRepository.getById(auth.currentUser.uid);
      setProfile(updated);
    },
    []
  );

  const resendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) return;
    await authService.resendVerificationEmail(auth.currentUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      authReady,
      profileLoading,
      profileError,
      refreshProfile,
      saveProfile,
      signInWithEmail: authService.signInWithEmail,
      registerWithEmail: authService.registerWithEmail,
      signInWithGoogle: authService.signInWithGoogle,
      resendVerificationEmail,
      logout: authService.logout,
    }),
    [
      user,
      profile,
      authReady,
      profileLoading,
      profileError,
      refreshProfile,
      saveProfile,
      resendVerificationEmail,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
