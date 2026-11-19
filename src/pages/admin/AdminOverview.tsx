import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Ban,
  Eye,
  Globe,
  Package,
  Pause,
  PauseCircle,
  Play,
  RefreshCw,
  ShoppingCart,
  Star,
  Users,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const AUTO_REFRESH_SECONDS = 30;

function formatSyncTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

export const AdminOverview: React.FC = () => {
  const {
    products,
    orders,
    customers,
    reviews,
    siteVisits,
    productViewCounts,
    lastSyncedAt,
    refreshFromServer,
    navigate,
    formatPrice,
  } = useStore();

  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(AUTO_REFRESH_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  const runRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      await refreshFromServer();
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
      setSecondsUntilRefresh(AUTO_REFRESH_SECONDS);
    }
  }, [refreshFromServer]);

  // Fetch latest snapshot immediately upon entering Overview
  useEffect(() => {
    void runRefresh();
  }, [runRefresh]);

  // 30-second automatic dashboard refresh timer
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const timer = window.setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          void runRefresh();
          return AUTO_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [autoRefreshEnabled, runRefresh]);

  const totalRevenue = orders
    .filter((o) => o.status !== 'Refunded' && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Shipped'
  ).length;
  const pausedOrdersCount = orders.filter((o) => o.status === 'Paused').length;
  const cancelledOrdersCount = orders.filter((o) => o.status === 'Cancelled').length;

  const totalProductViews = products.reduce(
    (sum, p) => sum + (productViewCounts[p.id] || 0),
    0
  );

  const lowStockCount = products.filter((p) => p.stock <= 6).length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'Pending').length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">Studio Overview</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Real-time site visits, inventory engagement, order pipeline, and client feedback metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div
            className="flex items-center gap-2 font-mono-tabular"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span>Updated {formatSyncTime(lastSyncedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {autoRefreshEnabled
                ? `Refresh in ${secondsUntilRefresh}s`
                : 'Auto-refresh paused'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAutoRefreshEnabled((prev) => {
                  const next = !prev;
                  if (next) setSecondsUntilRefresh(AUTO_REFRESH_SECONDS);
                  return next;
                });
              }}
              className="px-3 py-1.5 rounded-lg border font-medium inline-flex items-center gap-1.5 transition-colors hover:bg-black/[0.03] cursor-pointer"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              {autoRefreshEnabled ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => void runRefresh()}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg border font-medium inline-flex items-center gap-1.5 transition-colors hover:bg-black/[0.03] disabled:opacity-60 cursor-pointer"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing' : 'Refresh Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Site Visits KPI */}
        <div
          className="text-left rounded-xl border p-5 space-y-2"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Site Visits</span>
            <Globe className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">
            {siteVisits.toLocaleString('en-US')}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="tabular-nums font-medium">{totalProductViews.toLocaleString('en-US')}</span> total product views
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'orders' })}
          className="text-left rounded-xl border p-5 space-y-2 transition-colors hover:bg-black/[0.02] cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Net Studio Revenue</span>
            <ShoppingCart className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">
            {formatPrice(totalRevenue)}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="tabular-nums">{activeOrdersCount}</span> active ·{' '}
            <span className="tabular-nums">{pausedOrdersCount}</span> paused ·{' '}
            <span className="tabular-nums">{cancelledOrdersCount}</span> cancelled
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'products' })}
          className="text-left rounded-xl border p-5 space-y-2 transition-colors hover:bg-black/[0.02] cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Catalog Pieces</span>
            <Package className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">{products.length}</p>
          <p className="text-xs" style={{ color: lowStockCount > 0 ? '#b45309' : 'var(--color-text-muted)' }}>
            <span className="tabular-nums">{lowStockCount}</span> pieces at low studio stock
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'customers' })}
          className="text-left rounded-xl border p-5 space-y-2 transition-colors hover:bg-black/[0.02] cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Registered Clients</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">{customers.length}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Residential &amp; trade accounts
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'reviews' })}
          className="text-left rounded-xl border p-5 space-y-2 transition-colors hover:bg-black/[0.02] cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Review Queue</span>
            <Star className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">{reviews.length}</p>
          <p className="text-xs" style={{ color: pendingReviewsCount > 0 ? '#b45309' : 'var(--color-text-muted)' }}>
            <span className="tabular-nums">{pendingReviewsCount}</span> awaiting moderation
          </p>
        </button>
      </div>

      {/* Quick Engagement & Order Exceptions Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'products' })}
          className="text-left rounded-xl border p-5 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="space-y-1">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Total Product Views
            </p>
            <p className="text-xl font-semibold font-mono-tabular">
              {totalProductViews.toLocaleString('en-US')}
            </p>
          </div>
          <Eye className="w-5 h-5 opacity-60 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'orders' })}
          className="text-left rounded-xl border p-5 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="space-y-1">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Paused Orders
            </p>
            <p className="text-xl font-semibold font-mono-tabular text-amber-700">
              {pausedOrdersCount}
            </p>
          </div>
          <PauseCircle className="w-5 h-5 text-amber-700 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'orders' })}
          className="text-left rounded-xl border p-5 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="space-y-1">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Cancelled Orders
            </p>
            <p className="text-xl font-semibold font-mono-tabular text-rose-700">
              {cancelledOrdersCount}
            </p>
          </div>
          <Ban className="w-5 h-5 text-rose-700 shrink-0" />
        </button>
      </div>

      {/* Recent Orders Table -> Mobile Card View */}
      <section
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="font-display text-lg font-medium">Recent Orders</h2>
          <button
            type="button"
            onClick={() => navigate({ page: 'admin', module: 'orders' })}
            className="text-xs font-medium inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Manage Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 md:p-0">
          <table className="admin-responsive-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Client</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td data-primary="true" className="font-mono-tabular font-medium">
                    #{order.orderNumber}
                  </td>
                  <td data-label="Client">{order.customerName}</td>
                  <td data-label="Date" className="font-mono-tabular" style={{ color: 'var(--color-text-muted)' }}>
                    {order.createdAt}
                  </td>
                  <td data-label="Status">
                    <span
                      className={`text-xs font-semibold ${
                        order.status === 'Delivered'
                          ? 'text-emerald-700'
                          : order.status === 'Refunded' || order.status === 'Cancelled'
                          ? 'text-rose-700'
                          : order.status === 'Processing' ||
                            order.status === 'Shipped' ||
                            order.status === 'Paused'
                          ? 'text-amber-700'
                          : ''
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Total" className="md:text-right font-mono-tabular font-semibold">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

