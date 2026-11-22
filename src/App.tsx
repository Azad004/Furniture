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
    <div className="min-h-screen flex flex-col">
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
