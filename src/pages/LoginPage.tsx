import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, mapAuthErrorMessage } from '../services/firebase/authService';

export function LoginPage() {
  const { signInWithEmail, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const handleEmailSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResetNotice(null);
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setResetNotice(null);
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

  const handleForgotPassword = async () => {
    setError(null);
    setResetNotice(null);
    if (!email.trim()) {
      setError('Enter your email address above first, then select Forgot password.');
      return;
    }
    setBusy(true);
    try {
      await authService.sendPasswordReset(email);
      setResetNotice(`Password reset instructions sent to ${email.trim()}.`);
    } catch (err) {
      setError(mapAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="neu-card-white rounded-[32px] p-8 sm:p-10 text-center space-y-4">
          <h1 className="font-display text-2xl font-extrabold text-[#394A43]">
            Already Signed In
          </h1>
          <p className="text-sm text-[#5A6D65]">
            You are currently signed in as <strong className="text-[#394A43]">{user.email}</strong>.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/profile"
              className="px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
            >
              Go to Profile
            </Link>
            <Link
              to="/movies"
              className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="neu-card-white rounded-[32px] p-7 sm:p-9">
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#567360]">Marquee Account</p>
          <h1 className="font-display text-2xl font-extrabold text-[#394A43] tracking-tight mt-1">
            Sign in to your account
          </h1>
          <p className="text-sm text-[#5A6D65] mt-1.5">
            Access your city preferences, profile, and server-verified bookings.
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

        {resetNotice && (
          <div
            role="status"
            className="mb-5 p-4 rounded-2xl neu-card-mint flex items-start gap-2.5 text-xs text-[#394A43]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#394A43] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{resetNotice}</span>
          </div>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={handleGoogleSignIn}
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
            <span className="bg-[#FFFCF5] px-3 text-[#5A6D65]">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#394A43] mb-1.5">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 text-sm rounded-2xl neu-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-[#394A43]">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-[#567360] hover:text-[#394A43] cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 text-sm rounded-2xl neu-input"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 px-4 text-sm font-semibold rounded-full neu-btn-primary cursor-pointer mt-2"
          >
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#5A6D65]">
          New to Marquee?{' '}
          <Link
            to="/register"
            state={{ from: redirectTo }}
            className="font-bold text-[#567360] hover:text-[#394A43] underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
