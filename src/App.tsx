import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CityProvider } from './context/CityContext';
import { AuthProvider } from './context/AuthContext';
import { BookingDraftProvider } from './context/BookingDraftContext';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { ShowSelectionPage } from './pages/ShowSelectionPage';
import { SeatSelectionPage } from './pages/SeatSelectionPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { BookingsPage } from './pages/BookingsPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <CityProvider>
        <AuthProvider>
          <BookingDraftProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/movies/:movieId" element={<MovieDetailsPage />} />
                  <Route path="/movies/:movieId/shows" element={<ShowSelectionPage />} />
                  <Route path="/shows/:showId/seats" element={<SeatSelectionPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </BookingDraftProvider>
        </AuthProvider>
      </CityProvider>
    </ErrorBoundary>
  );
}
