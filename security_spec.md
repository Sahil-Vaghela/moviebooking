# Marquee Firestore Security Specification

## 1. Data Invariants

1. **User Profile Ownership & PII Isolation (`/users/{userId}`)**: A customer profile contains PII (`email`, optional `phone`) and must be readable and writable exclusively by the authenticated owner (`request.auth.uid == userId`). Directory listing (`list`) and deletion (`delete`) from the client SDK are forbidden.
2. **Email Verification Gate**: All client-initiated writes to `/users/{userId}` require `request.auth.token.email_verified == true`.
3. **Immutable Identity & Timestamps**: `uid`, `email`, `authProvider`, and `createdAt` are immutable after profile creation; `createdAt` on create and `updatedAt` on update must equal `request.time`.
4. **Server-Authoritative Ticketing Ledger**: Client SDK writes (`create`, `update`, `delete`) to `/bookings/{bookingId}`, `/showSeats/{showId}/seats/{seatId}`, `/seatLocks/{lockId}`, and `/payments/{paymentId}` are unconditionally denied. Only trusted backend Cloud Functions (Admin SDK) may mutate seat occupancy, seat locks, payment states, or booking confirmations.
5. **Scoped Owner Reads**: Users may only `get` or `list` documents in `/bookings`, `/seatLocks`, and `/payments` where `resource.data.userId == request.auth.uid`.
6. **Bounded Payloads & Path Hardening**: Every single-document path variable is checked with `isValidId()` (`^[a-zA-Z0-9_\-]+$`, max 128 chars), and all strings and arrays enforce explicit size bounds.

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Attack Vector | Target Collection | Payload / Operation | Expected Result |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Identity Spoofing** | `/users/user_a` | User B attempts `create` with `{ uid: "user_a", ... }` | `PERMISSION_DENIED` |
| 2 | **Shadow Field Injection** | `/users/user_a` | User A creates/updates profile with extra field `isAdmin: true` | `PERMISSION_DENIED` |
| 3 | **Unverified Email Write** | `/users/user_a` | User A with `email_verified: false` writes profile | `PERMISSION_DENIED` |
| 4 | **PII Cross-Read** | `/users/user_b` | Authenticated User A attempts `get` on User B's profile | `PERMISSION_DENIED` |
| 5 | **User Enumeration** | `/users` | Authenticated User A attempts `list` on `/users` | `PERMISSION_DENIED` |
| 6 | **Immutable Field Tamper** | `/users/user_a` | User A updates `createdAt` or `authProvider` | `PERMISSION_DENIED` |
| 7 | **Timestamp Forgery** | `/users/user_a` | User A creates profile with backdated `createdAt` (`!= request.time`) | `PERMISSION_DENIED` |
| 8 | **Array Exhaustion** | `/users/user_a` | User A submits `preferredLanguages` with 25 entries (`> 8`) | `PERMISSION_DENIED` |
| 9 | **Fake Client Booking** | `/bookings/bk_fake` | Authenticated User A attempts `create` with `status: "CONFIRMED"` | `PERMISSION_DENIED` |
| 10 | **Client Seat Hijack** | `/showSeats/sh_1/seats/A1` | Authenticated User A attempts `update` setting `status: "LOCKED"` | `PERMISSION_DENIED` |
| 11 | **Fake Seat Lock Mint** | `/seatLocks/lk_fake` | Authenticated User A attempts `create` on `/seatLocks` | `PERMISSION_DENIED` |
| 12 | **Cross-User Booking/Payment Read** | `/bookings/bk_other` & `/payments/pay_other` | User A attempts `get` or unfiltered `list` across other users' records | `PERMISSION_DENIED` |
