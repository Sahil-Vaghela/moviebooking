import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, LogOut, MailCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { EmptyState, LoadingState } from '../components/common/StateBlocks';

const LANGUAGE_CHOICES = [
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Kannada',
  'Marathi',
  'Bengali',
  'Gujarati',
];

export function ProfilePage() {
  const {
    user,
    profile,
    authReady,
    profileLoading,
    profileError,
    saveProfile,
    refreshProfile,
    resendVerificationEmail,
    logout,
  } = useAuth();
  const { cities, selectedCity, selectCity } = useCity();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredCityId, setPreferredCityId] = useState(selectedCity.id);
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(['Hindi', 'English']);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setDisplayName(profile?.displayName || user.displayName || '');
    setPhone(profile?.phone || '');
    setPreferredCityId(profile?.preferredCityId || selectedCity.id);
    setPreferredLanguages(
      profile?.preferredLanguages && profile.preferredLanguages.length > 0
        ? profile.preferredLanguages
        : ['Hindi', 'English']
    );
  }, [user, profile, selectedCity.id]);

  if (!authReady || profileLoading) {
    return <LoadingState label="Loading your profile..." />;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Sign in to view your profile"
          description="Manage your preferred Indian city, cinema language preferences, and account details."
          action={
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/login"
                state={{ from: '/profile' }}
                className="px-6 py-2.5 text-sm font-semibold rounded-full neu-btn-primary"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                state={{ from: '/profile' }}
                className="px-5 py-2.5 text-sm font-semibold rounded-full neu-btn"
              >
                Create Account
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const toggleLanguage = (lang: string) => {
    setPreferredLanguages((prev) => {
      if (prev.includes(lang)) {
        return prev.filter((item) => item !== lang);
      }
      if (prev.length >= 8) return prev;
      return [...prev, lang];
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      await saveProfile({
        displayName,
        phone,
        preferredCityId,
        preferredLanguages,
      });
      selectCity(preferredCityId);
      setStatusMessage('Profile preferences saved to Firestore.');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to save profile changes.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-7">
      {/* Raised Profile Header Card */}
      <div className="neu-card rounded-[30px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <p className="text-xs font-semibold text-[#567360]">Account Settings</p>
          <h1 className="font-display text-3xl font-extrabold text-[#394A43] tracking-tight mt-1">
            {profile?.displayName || user.displayName || 'Your Profile'}
          </h1>
          <p className="text-sm text-[#5A6D65] mt-1">
            {user.email} · {user.emailVerified ? 'Verified email' : 'Email verification pending'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full neu-btn self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#567360]" />
          <span>Sign Out</span>
        </button>
      </div>

      {!user.emailVerified && (
        <div className="neu-card-peach rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <MailCheck className="w-5 h-5 text-[#6D3F2F] shrink-0 mt-0.5" />
            <div className="text-xs text-[#394A43] space-y-1">
              <p className="font-bold">Email Verification Required for Firestore Writes</p>
              <p className="leading-relaxed text-[#4F433C]">
                Our Firestore security rules require a verified email before saving profile updates.
                Check your inbox or resend a verification link.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                await resendVerificationEmail();
                setStatusMessage('Verification email sent. Refresh once verified.');
              }}
              className="px-4 py-2 text-xs font-semibold rounded-full neu-btn cursor-pointer whitespace-nowrap"
            >
              Resend Email
            </button>
            <button
              type="button"
              onClick={() => void refreshProfile()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full neu-btn cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {(profileError || errorMessage) && (
        <div
          role="alert"
          className="neu-card-peach rounded-2xl p-4 flex items-start gap-2.5 text-xs text-[#394A43]"
        >
          <AlertCircle className="w-4 h-4 text-[#6D3F2F] shrink-0 mt-0.5" />
          <span className="break-words">{errorMessage || profileError}</span>
        </div>
      )}

      {statusMessage && (
        <div
          role="status"
          className="neu-card-mint rounded-2xl p-4 flex items-start gap-2.5 text-xs font-semibold text-[#394A43]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#394A43] shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="neu-card-white rounded-[30px] p-6 sm:p-8 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="prof-name" className="block text-xs font-semibold text-[#394A43] mb-1.5">
              Display Name
            </label>
            <input
              id="prof-name"
              type="text"
              required
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-2xl neu-input"
            />
          </div>

          <div>
            <label htmlFor="prof-phone" className="block text-xs font-semibold text-[#394A43] mb-1.5">
              Mobile Number (Optional)
            </label>
            <input
              id="prof-phone"
              type="tel"
              maxLength={20}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 text-sm rounded-2xl neu-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="prof-city" className="block text-xs font-semibold text-[#394A43] mb-1.5">
            Default Cinema City
          </label>
          <select
            id="prof-city"
            value={preferredCityId}
            onChange={(e) => setPreferredCityId(e.target.value)}
            className="w-full sm:w-80 px-4 py-3 text-sm rounded-2xl neu-input cursor-pointer"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.state})
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#394A43] mb-2.5">
            Preferred Film Languages (up to 8)
          </p>
          <div className="flex flex-wrap gap-2.5">
            {LANGUAGE_CHOICES.map((lang) => {
              const selected = preferredLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    selected ? 'neu-btn-primary' : 'neu-btn'
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-5 border-t border-[#394A43]/10 flex items-center justify-between gap-4">
          <Link
            to="/bookings"
            className="text-xs font-bold text-[#567360] hover:text-[#394A43] underline underline-offset-4"
          >
            View My Bookings
          </Link>
          <button
            type="submit"
            disabled={saving || !user.emailVerified}
            className="px-7 py-3 text-sm font-semibold rounded-full neu-btn-primary cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
