# Marquee — Movie Ticket Booking Platform

A production-oriented cinema discovery and ticket booking web application inspired by BookMyShow, built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **React Router**, and **Firebase** (Authentication & Firestore).

## Key Features

- **10 Predefined Indian Cities**: Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, and Kochi, with persistent city selection (`localStorage`) and an accessible city switcher modal.
- **Relational Local JSON Catalogue (`src/data/`)**: Consistent relational datasets for 10 cities, 8 genres, 2 campaign banners, 16 movies (13 Now Showing + 3 Coming Soon), 20 theatres, 21 screens with Platinum/Gold/Silver seat tiers, and multi-day showtimes.
- **Full Customer Journey**:
  - Home showcase with quick city search and flagship venues
  - Searchable & filterable Movies catalogue (URL-synced query, status, language, genre, format)
  - Movie Details with synopsis, cast & crew, and related city screenings
  - Theatre & Show Selection with date strip, language/format/time-of-day filters
  - Interactive Auditorium Seat Selection with live Firestore `showSeats` sync support
  - Checkout Review with itemized INR fare breakdown (tickets, convenience fee, 18% GST)
  - Login, Registration, User Profile (Firestore-synced preferences), My Bookings, About, and 404 pages
- **Zero Faked Transactions**: Seat locks, payment gateway verification, and booking confirmation are strictly gated behind a typed `SecureTicketingBackend` Cloud Functions interface (`src/services/backend/cloudFunctionsContract.ts`) and hardened `firestore.rules`.

## Running Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and supply your Firebase web app credentials (or keep the provisioned `firebase-applet-config.json`):

```bash
cp .env.example .env.local
```

Supported variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_DATABASE_ID`
- `VITE_CLOUD_FUNCTIONS_BASE_URL` *(optional; required to activate live server-side seat locks and payment confirmation)*

### 3. Firebase Console Setup

1. Open your project in the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication → Sign-in method**:
   - **Google**: Enabled by default via AI Studio provisioning.
   - **Email/Password**: Toggle **Enable** and save so email/password registration and login work in your Firebase project.
3. Add your local origin (`localhost`) and production domain under **Authentication → Settings → Authorized domains**.
4. Review and deploy `firestore.rules` (see `firebase-blueprint.json` and `security_spec.md` for collection schemas and security invariants).

### 4. Start Development Server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### 5. Typecheck, Lint & Production Build

```bash
npm run lint
npx eslint firestore.rules
npm run build
```

## Cloud Functions Integration Contract

To activate real atomic seat locking, payment verification, and booking creation, deploy Firebase Cloud Functions implementing the endpoints consumed by `src/services/backend/cloudFunctionsContract.ts`:

- `POST /ticketing/acquireSeatLock` — Validates Firebase ID token, checks `showSeats/{showId}/seats` in a Firestore transaction, creates a time-boxed `seatLocks/{lockId}` document, and marks seats `LOCKED`.
- `POST /ticketing/releaseSeatLock` — Releases an unexpired hold owned by the caller.
- `POST /payments/createIntent` — Creates a Razorpay/Stripe/UPI order server-side using authoritative server pricing and writes a `payments/{paymentId}` record.
- `POST /bookings/verifyPaymentAndConfirm` — Verifies gateway webhook/signature server-side, marks seats `BOOKED`, consumes the `seatLock`, and mints a `CONFIRMED` document in `bookings/{bookingId}`.
