import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/storefront/CartDrawer';
import { HomePage } from './pages/storefront/HomePage';
import { ShopPage } from './pages/storefront/ShopPage';
import { CollectionsPage } from './pages/storefront/CollectionsPage';
import { ProductDetailPage } from './pages/storefront/ProductDetailPage';
import { TrackOrderPage } from './pages/storefront/TrackOrderPage';
import { AccountPage } from './pages/storefront/AccountPage';
import {
  HelpFaqPage,
  RecentlyViewedPage,
  ServiceRequestPage,
  ShowroomsPage,
  WishlistPage,
} from './pages/storefront/MorePages';
import {
  DesignStyleReportPage,
  EventsPage,
  InnovationPage,
} from './pages/storefront/EditorialPages';
import { CheckoutPage } from './pages/storefront/CheckoutPage';
import {
  AboutPage,
  ContactPage,
  PrivacyPolicyPage,
} from './pages/storefront/StaticPages';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SafeImage } from './components/common/SafeImage';

const INTERIOR_BACKDROP_SRC =
  '/src/assets/images/furniture_interior_backdrop_1795089361104.jpg';

const AppRouter: React.FC = () => {
  const { route } = useStore();

  if (route.page === 'admin') {
    return (
      <AdminLayout
        activeModule={route.module}
        productMode={route.productMode}
        productId={route.productId}
      />
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Subtle Architectural Furniture Interior Backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none" aria-hidden="true">
        <SafeImage
          src={INTERIOR_BACKDROP_SRC}
          alt="Serene architectural furniture interior backdrop"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0 backdrop-blur-[1.5px]"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-bg-canvas) 86%, transparent)',
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        <CartDrawer />
        <div className="flex-1">
          {route.page === 'home' && <HomePage />}
          {route.page === 'shop' && (
            <ShopPage initialCategory={route.category} initialQuery={route.query} />
          )}
          {route.page === 'collections' && <CollectionsPage />}
          {route.page === 'product' && <ProductDetailPage slug={route.slug} />}
          {route.page === 'track' && (
            <TrackOrderPage initialOrderNumber={route.orderNumber} />
          )}
          {route.page === 'account' && <AccountPage initialTab={route.tab} />}
          {route.page === 'showrooms' && <ShowroomsPage />}
          {route.page === 'service' && <ServiceRequestPage />}
          {route.page === 'help' && <HelpFaqPage />}
          {route.page === 'recently-viewed' && <RecentlyViewedPage />}
          {route.page === 'wishlist' && <WishlistPage />}
          {route.page === 'events' && <EventsPage />}
          {route.page === 'style-report' && <DesignStyleReportPage />}
          {route.page === 'innovation' && <InnovationPage />}
          {route.page === 'checkout' && <CheckoutPage />}
          {route.page === 'about' && <AboutPage />}
          {route.page === 'contact' && <ContactPage />}
          {route.page === 'privacy' && <PrivacyPolicyPage />}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AppRouter />
      </StoreProvider>
    </ErrorBoundary>
  );
}
