import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  LayoutDashboard,
  Lock,
  MapPin,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminModule } from '../../types/store';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminProductEditor } from './AdminProductEditor';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminContent } from './AdminContent';
import { AdminHotspots } from './AdminHotspots';
import { AdminReviews } from './AdminReviews';
import { AdminSettings } from './AdminSettings';
import { AdminAuthGate } from '../../components/admin/AdminAuthGate';
import {
  clearAdminSession,
  isAdminSessionValid,
  touchAdminSession,
} from '../../utils/security';

interface AdminLayoutProps {
  activeModule: AdminModule;
  productMode?: 'new' | 'edit';
  productId?: string;
}

const NAV_ITEMS: Array<{
  id: AdminModule;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Product Management', icon: Package },
  { id: 'orders', label: 'Order Management', icon: ShoppingCart },
  { id: 'customers', label: 'Customer Management', icon: Users },
  { id: 'hotspots', label: 'Pin Points & Details', icon: MapPin },
  { id: 'content', label: 'Content Management', icon: FileText },
  { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
  { id: 'settings', label: 'System Settings', icon: Settings },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeModule,
  productMode,
  productId,
}) => {
  const { navigate, currencySettings, updateCurrencySettings } = useStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean>(() => isAdminSessionValid());

  // Maintain sliding 30-minute idle timeout and auto-lock if expired
  useEffect(() => {
    if (!authenticated) return;

    const refreshActivity = () => {
      if (!touchAdminSession()) {
        setAuthenticated(false);
      }
    };

    const interval = window.setInterval(() => {
      if (!isAdminSessionValid()) {
        setAuthenticated(false);
      }
    }, 30_000);

    window.addEventListener('pointerdown', refreshActivity, { passive: true });
    window.addEventListener('keydown', refreshActivity, { passive: true });

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('pointerdown', refreshActivity);
      window.removeEventListener('keydown', refreshActivity);
    };
  }, [authenticated]);

  const handleLockSession = () => {
    clearAdminSession();
    setMobileSidebarOpen(false);
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <AdminAuthGate
        onAuthenticated={() => setAuthenticated(true)}
        onExit={() => navigate({ page: 'home' })}
      />
    );
  }

  const activeItem = NAV_ITEMS.find((n) => n.id === activeModule) || NAV_ITEMS[0];

  const handleNavSelect = (module: AdminModule) => {
    setMobileSidebarOpen(false);
    navigate({ page: 'admin', module });
  };

  return (
    <div
      className="vespera-admin-shell min-h-screen flex flex-col lg:flex-row"
      style={{ backgroundColor: 'var(--color-bg-canvas)', color: 'var(--color-text-primary)' }}
    >
      {/* Desktop Sidebar (276px) */}
      <aside
        className="hidden lg:flex lg:w-[276px] lg:shrink-0 lg:flex-col border-r sticky top-0 h-screen"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="px-6 h-[70px] flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={() => navigate({ page: 'home' })}
            className="font-display text-2xl font-semibold tracking-tight cursor-pointer"
          >
            Vespera Admin
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Admin sidebar navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active ? 'vespera-btn-primary' : 'hover:bg-black/5'
                }`}
                style={{
                  color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={handleLockSession}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold hover:bg-black/5 cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Console</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ page: 'home' })}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold hover:bg-black/5 cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/45"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside
            className="relative w-72 max-w-[85vw] h-full flex flex-col border-r shadow-2xl"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="px-5 h-16 flex items-center justify-between border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-display text-xl font-semibold">Vespera Admin</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="Close admin menu"
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      active ? 'vespera-btn-primary' : 'hover:bg-black/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <button
                type="button"
                onClick={() => {
                  setMobileSidebarOpen(false);
                  navigate({ page: 'home' });
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Storefront</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Breadcrumb Bar */}
        <header
          className="h-[70px] px-4 sm:px-6 lg:px-7 border-b flex items-center justify-between gap-4 sticky top-0 z-30"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open admin sidebar"
              className="lg:hidden w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>
              <span>Admin Console</span>
              <span aria-hidden="true">/</span>
              {activeModule === 'products' && productMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate({ page: 'admin', module: 'products' })}
                    className="hover:underline cursor-pointer"
                  >
                    {activeItem.label}
                  </button>
                  <span aria-hidden="true">/</span>
                  <span className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {productMode === 'new' ? 'Create Piece' : 'Edit Piece'}
                  </span>
                </>
              ) : (
                <span className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {activeItem.label}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div
              role="group"
              aria-label="Storefront currency"
              className="inline-flex items-center p-0.5 rounded-lg border"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg-surface-alt)',
              }}
            >
              {(['USD', 'BDT'] as const).map((code) => {
                const active = currencySettings.currency === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => updateCurrencySettings({ currency: code })}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: active ? 'var(--color-accent)' : 'transparent',
                      color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
                    }}
                  >
                    {code === 'USD' ? '$ USD' : '৳ BDT'}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleLockSession}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 whitespace-nowrap shrink-0 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>

            <button
              type="button"
              onClick={() => navigate({ page: 'home' })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 whitespace-nowrap shrink-0 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span>View Storefront</span>
            </button>
          </div>
        </header>

        <main className="flex-1 w-full p-4 sm:p-6 lg:px-7">
          {activeModule === 'overview' && <AdminOverview />}
          {activeModule === 'products' &&
            (productMode ? (
              <AdminProductEditor mode={productMode} productId={productId} />
            ) : (
              <AdminProducts />
            ))}
          {activeModule === 'orders' && <AdminOrders />}
          {activeModule === 'customers' && <AdminCustomers />}
          {activeModule === 'hotspots' && <AdminHotspots />}
          {activeModule === 'content' && <AdminContent />}
          {activeModule === 'reviews' && <AdminReviews />}
          {activeModule === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};
