/**
 * Firestore Security Rules Verification Specification (Dirty Dozen Suite)
 *
 * Run against the Firebase Emulator Suite once configured:
 *   firebase emulators:exec --only firestore "npx tsx firestore.rules.test.ts"
 */

export interface AdversarialCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  actorUid: string | null;
  emailVerified: boolean;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: AdversarialCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on User Profile Create',
    collectionPath: 'users/user_alice',
    operation: 'create',
    actorUid: 'user_mallory',
    emailVerified: true,
    payload: {
      uid: 'user_alice',
      displayName: 'Mallory',
      email: 'alice@example.com',
      preferredCityId: 'city-mumbai',
      preferredLanguages: ['Hindi'],
      authProvider: 'google.com',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Shadow Field Injection (isAdmin privilege escalation)',
    collectionPath: 'users/user_alice',
    operation: 'update',
    actorUid: 'user_alice',
    emailVerified: true,
    payload: {
      displayName: 'Alice',
      isAdmin: true,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Email Profile Write',
    collectionPath: 'users/user_alice',
    operation: 'create',
    actorUid: 'user_alice',
    emailVerified: false,
    payload: {
      uid: 'user_alice',
      displayName: 'Alice',
      email: 'alice@example.com',
      preferredCityId: 'city-mumbai',
      preferredLanguages: ['English'],
      authProvider: 'password',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'PII Cross-User Profile Read',
    collectionPath: 'users/user_bob',
    operation: 'get',
    actorUid: 'user_alice',
    emailVerified: true,
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Blanket User Directory Enumeration',
    collectionPath: 'users',
    operation: 'list',
    actorUid: 'user_alice',
    emailVerified: true,
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Immutable Auth Provider & Email Tampering',
    collectionPath: 'users/user_alice',
    operation: 'update',
    actorUid: 'user_alice',
    emailVerified: true,
    payload: {
      email: 'spoofed@example.com',
      authProvider: 'google.com',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Client-Forged Backdated Timestamp',
    collectionPath: 'users/user_alice',
    operation: 'create',
    actorUid: 'user_alice',
    emailVerified: true,
    payload: {
      uid: 'user_alice',
      displayName: 'Alice',
      email: 'alice@example.com',
      preferredCityId: 'city-mumbai',
      preferredLanguages: ['Hindi'],
      authProvider: 'google.com',
      createdAt: '2020-01-01T00:00:00.000Z',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Preferred Languages Array Exhaustion (> 8 items)',
    collectionPath: 'users/user_alice',
    operation: 'update',
    actorUid: 'user_alice',
    emailVerified: true,
    payload: {
      preferredLanguages: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client-Forged Confirmed Booking Creation',
    collectionPath: 'bookings/bk_forged_01',
    operation: 'create',
    actorUid: 'user_alice',
    emailVerified: true,
    payload: {
      id: 'bk_forged_01',
      userId: 'user_alice',
      showId: 'show-mum-1',
      status: 'CONFIRMED',
      totalInr: 0,
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Direct Client Mutation of Show Seat Status',
    collectionPath: 'showSeats/show-mum-1/seats/A1',
    operation: 'update',
    actorUid: 'user_alice',
    emailVerified: true,
    payload: {
      status: 'BOOKED',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Direct Client Creation of Seat Lock',
    collectionPath: 'seatLocks/lock_forged_01',
    operation: 'create',
    actorUid: 'user_alice',
    emailVerified: true,
    payload: {
      id: 'lock_forged_01',
      userId: 'user_alice',
      showId: 'show-mum-1',
      seatIds: ['A1'],
      status: 'ACTIVE',
    },
    expectedOutcome: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Cross-User Booking & Payment Record Access',
    collectionPath: 'payments/pay_bob_01',
    operation: 'get',
    actorUid: 'user_alice',
    emailVerified: true,
    expectedOutcome: 'PERMISSION_DENIED',
  },
];
