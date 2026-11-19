import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { CitySelectorModal } from '../components/navigation/CitySelectorModal';

export function MainLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5EBDD] text-[#394A43]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CitySelectorModal />
    </div>
  );
}
