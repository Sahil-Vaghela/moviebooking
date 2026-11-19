import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './client';
import { handleFirestoreError, OperationType } from './errorHandler';
import type { AuthProviderKind, UserProfile, UserProfileUpdateInput } from '../../types/user';

const COLLECTION = 'users';

function toIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

function sanitizeDisplayName(name: string): string {
  const trimmed = name.trim().slice(0, 80);
  return trimmed.length > 0 ? trimmed : 'Marquee Member';
}

function sanitizeLanguages(languages: string[]): string[] {
  return Array.from(
    new Set(
      languages
        .map((lang) => lang.trim().slice(0, 32))
        .filter((lang) => lang.length > 0)
    )
  ).slice(0, 8);
}

function sanitizePhone(phone?: string): string {
  return (phone ?? '').trim().slice(0, 20);
}

export const usersRepository = {
  async getById(uid: string): Promise<UserProfile | null> {
    const path = `${COLLECTION}/${uid}`;
    try {
      const snap = await getDoc(doc(db, COLLECTION, uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        uid: String(data.uid ?? uid),
        displayName: String(data.displayName ?? 'Marquee Member'),
        email: String(data.email ?? ''),
        phone: typeof data.phone === 'string' ? data.phone : '',
        preferredCityId: String(data.preferredCityId ?? 'city-mumbai'),
        preferredLanguages: Array.isArray(data.preferredLanguages)
          ? data.preferredLanguages.map(String)
          : [],
        authProvider: data.authProvider === 'google.com' ? 'google.com' : 'password',
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async createProfile(params: {
    uid: string;
    displayName: string;
    email: string;
    preferredCityId: string;
    authProvider: AuthProviderKind;
    preferredLanguages?: string[];
    phone?: string;
  }): Promise<void> {
    const path = `${COLLECTION}/${params.uid}`;
    try {
      await setDoc(doc(db, COLLECTION, params.uid), {
        uid: params.uid.slice(0, 128),
        displayName: sanitizeDisplayName(params.displayName),
        email: params.email.trim().slice(0, 160),
        phone: sanitizePhone(params.phone),
        preferredCityId: params.preferredCityId.slice(0, 64),
        preferredLanguages: sanitizeLanguages(params.preferredLanguages ?? ['Hindi', 'English']),
        authProvider: params.authProvider,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateProfile(uid: string, input: UserProfileUpdateInput): Promise<void> {
    const path = `${COLLECTION}/${uid}`;
    try {
      await updateDoc(doc(db, COLLECTION, uid), {
        displayName: sanitizeDisplayName(input.displayName),
        phone: sanitizePhone(input.phone),
        preferredCityId: input.preferredCityId.slice(0, 64),
        preferredLanguages: sanitizeLanguages(input.preferredLanguages),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },
};
