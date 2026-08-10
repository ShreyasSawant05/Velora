import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { CartDrawer } from './components/Drawers/CartDrawer';
import { SearchDrawer } from './components/Drawers/SearchDrawer';
import { QuickViewModal } from './components/Drawers/QuickViewModal';
import { Home } from './pages/Home/Home';
import { Collection } from './pages/Collection/Collection';
import { ProductDetail } from './pages/ProductDetail/ProductDetail';
import { Account } from './pages/Account/Account';
import { About } from './pages/About/About';
import { Contact } from './pages/Contact/Contact';
import { CheckCircle } from 'lucide-react';

import { useScrollReveal } from './hooks/useScrollReveal';

// Scroll to top helper on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Toast notification component
const ToastNotification = () => {
  const { toastMessage } = useCart();
  if (!toastMessage) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 50,
      animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <div style={{
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        padding: '12px 20px',
        borderRadius: '9999px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        border: '1px solid rgba(255,255,255,0.2)',
        fontFamily: 'var(--font-sans)'
      }}>
        <CheckCircle size={16} style={{ color: '#6ee7b7' }} />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

const AppContent = () => {
  useScrollReveal();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      <ScrollToTop />
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/product/:handle" element={<ProductDetail />} />
          <Route path="/account" element={<Account />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <SearchDrawer />
      <QuickViewModal />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
