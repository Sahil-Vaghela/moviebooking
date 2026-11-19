import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mapAuthErrorMessage } from '../services/firebase/authService';

export function RegisterPage() {
  const { registerWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from || '/profile';

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (displayName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await registerWithEmail({ displayName, email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="neu-card-white rounded-[32px] p-7 sm:p-9">
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#567360]">Create Account</p>
          <h1 className="font-display text-2xl font-extrabold text-[#394A43] tracking-tight mt-1">
            Join Marquee
          </h1>
          <p className="text-sm text-[#5A6D65] mt-1.5">
            Save your preferred city and languages, and view your ticket history across devices.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-2xl neu-card-peach flex items-start gap-2.5 text-xs text-[#394A43]"
          >
            <AlertCircle className="w-4 h-4 text-[#6D3F2F] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={handleGoogleSignUp}
          className="w-full py-3 px-4 rounded-full neu-btn text-sm font-semibold text-[#394A43] flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.96H1.28v3.1A12 12 0 0 0 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.28A7.22 7.22 0 0 1 4.9 12c0-.79.14-1.56.38-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4-3.1Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4 3.1c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#394A43]/12" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#FFFCF5] px-3 text-[#5A6D65]">or register with email</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-semibold text-[#394A43] mb-1.5">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              maxLength={80}
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Aarav Mehta"
              className="w-full px-4 py-3 text-sm rounded-2xl neu-input"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-[#394A43] mb-1.5">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              required
              maxLength={160}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 text-sm rounded-2xl neu-input"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-semibold text-[#394A43] mb-1.5">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 text-sm rounded-2xl neu-input"
            />
          </div>

          <div>
            <label
              htmlFor="reg-confirm-password"
              className="block text-xs font-semibold text-[#394A43] mb-1.5"
            >
              Confirm Password
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 text-sm rounded-2xl neu-input"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 px-4 text-sm font-semibold rounded-full neu-btn-primary cursor-pointer mt-2"
          >
            {busy ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#5A6D65]">
          Already have an account?{' '}
          <Link
            to="/login"
            state={{ from: redirectTo }}
            className="font-bold text-[#567360] hover:text-[#394A43] underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
