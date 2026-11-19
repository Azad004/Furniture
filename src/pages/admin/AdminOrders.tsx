import React, { useState } from 'react';
import { Ban, CheckCircle2, Eye, PauseCircle, RotateCcw, ShoppingCart, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types/store';

const STATUS_TABS: Array<OrderStatus | 'All'> = [
  'All',
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Paused',
  'Cancelled',
  'Refunded',
];

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, formatPrice } = useStore();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundOrderTarget, setRefundOrderTarget] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('Client requested return within 30-day residential trial.');

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Shipped'
  ).length;
  const pausedOrders = orders.filter((o) => o.status === 'Paused');
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled');
  const pausedUsersCount = new Set(pausedOrders.map((o) => o.customerEmail.toLowerCase())).size;
  const cancelledUsersCount = new Set(cancelledOrders.map((o) => o.customerEmail.toLowerCase())).size;

  const filtered = orders.filter((o) =>
    statusFilter === 'All' ? true : o.status === statusFilter
  );

  const handleConfirmRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderTarget) return;
    updateOrderStatus(refundOrderTarget.id, 'Refunded', refundReason.trim());
    setRefundOrderTarget(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium">Order Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Track white-glove fulfillment stages, paused &amp; cancelled orders, and client refunds.
        </p>
      </div>

      {/* Order Pipeline Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('All')}
          className="text-left rounded-xl border p-4 sm:p-5 space-y-1.5 hover:bg-black/[0.02] transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Total Orders</span>
            <ShoppingCart className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">{orders.length}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Processing')}
          className="text-left rounded-xl border p-4 sm:p-5 space-y-1.5 hover:bg-black/[0.02] transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Active Fulfillment</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">{activeOrdersCount}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Paused')}
          className="text-left rounded-xl border p-4 sm:p-5 space-y-1.5 hover:bg-black/[0.02] transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>User Paused Orders</span>
            <PauseCircle className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular text-amber-700">
            {pausedOrders.length}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="tabular-nums">{pausedUsersCount}</span> {pausedUsersCount === 1 ? 'user' : 'users'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Cancelled')}
          className="text-left rounded-xl border p-4 sm:p-5 space-y-1.5 hover:bg-black/[0.02] transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>User Cancelled Orders</span>
            <Ban className="w-4 h-4 text-rose-700" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular text-rose-700">
            {cancelledOrders.length}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="tabular-nums">{cancelledUsersCount}</span> {cancelledUsersCount === 1 ? 'user' : 'users'}
          </p>
        </button>
      </div>

      {/* Pipeline Status Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 rounded-lg border w-fit" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}>
        {STATUS_TABS.map((tab) => {
          const active = statusFilter === tab;
          const tabCount =
            tab === 'All' ? orders.length : orders.filter((o) => o.status === tab).length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                active ? 'vespera-btn-primary' : 'hover:bg-black/5'
              }`}
            >
              {tab} ({tabCount})
            </button>
          );
        })}
      </div>

      {/* Orders Table -> Stacked Mobile Cards */}
      <div
        className="rounded-xl border overflow-hidden md:overflow-visible"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="p-3 md:p-0">
          <table className="admin-responsive-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client</th>
                <th>Delivery</th>
                <th>Date</th>
                <th>Pipeline Status</th>
                <th className="text-right">Total</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td data-primary="true" className="font-mono-tabular font-semibold">
                    #{order.orderNumber}
                  </td>
                  <td data-label="Client">
                    <div className="md:text-left text-right">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {order.items.reduce((s, i) => s + i.quantity, 0)} piece(s)
                      </p>
                    </div>
                  </td>
                  <td data-label="Delivery" className="text-xs">
                    {order.deliveryTier}
                  </td>
                  <td data-label="Date" className="font-mono-tabular text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {order.createdAt}
                  </td>
                  <td data-label="Pipeline Status">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value as OrderStatus)
                      }
                      aria-label={`Update status for order ${order.orderNumber}`}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-md border bg-[var(--color-bg-surface)] cursor-pointer"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Paused">Paused</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </td>
                  <td data-label="Total" className="md:text-right font-mono-tabular font-semibold">
                    {formatPrice(order.total)}
                  </td>
                  <td data-label="Actions" className="md:text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1.5 rounded-md border text-xs font-medium inline-flex items-center gap-1 hover:bg-black/5 cursor-pointer"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      {order.status !== 'Refunded' && order.status !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => setRefundOrderTarget(order)}
                          className="px-2.5 py-1.5 rounded-md border text-xs font-medium text-rose-700 inline-flex items-center gap-1 hover:bg-rose-50 cursor-pointer"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Refund</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/45" onClick={() => setSelectedOrder(null)} />
          <div
            className="relative w-full max-w-lg rounded-xl border p-6 space-y-5 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <p className="text-xs font-mono-tabular" style={{ color: 'var(--color-text-muted)' }}>
                  Order #{selectedOrder.orderNumber} · {selectedOrder.createdAt}
                </p>
                <h2 className="font-display text-xl font-medium">
                  {selectedOrder.customerName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm space-y-1">
              <p>
                <span style={{ color: 'var(--color-text-muted)' }}>Email: </span>
                {selectedOrder.customerEmail}
              </p>
              <p>
                <span style={{ color: 'var(--color-text-muted)' }}>Destination: </span>
                {selectedOrder.shippingAddress}
              </p>
              <p>
                <span style={{ color: 'var(--color-text-muted)' }}>Service: </span>
                {selectedOrder.deliveryTier} ({selectedOrder.paymentMethod})
              </p>
              {selectedOrder.refundReason && (
                <p className="text-rose-700 pt-1">
                  <strong>Refund Note:</strong> {selectedOrder.refundReason}
                </p>
              )}
            </div>

            <div className="rounded-lg border divide-y text-sm" style={{ borderColor: 'var(--color-border)' }}>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {item.finish} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono-tabular font-semibold">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="p-3 flex items-center justify-between font-semibold">
                <span>Order Total</span>
                <span className="font-mono-tabular">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/45" onClick={() => setRefundOrderTarget(null)} />
          <form
            onSubmit={handleConfirmRefund}
            className="relative w-full max-w-md rounded-xl border p-6 space-y-4 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h2 className="font-display text-xl font-medium">
              Process Refund — #{refundOrderTarget.orderNumber}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Issuing a full refund of{' '}
              <strong className="font-mono-tabular" style={{ color: 'var(--color-text-primary)' }}>
                {formatPrice(refundOrderTarget.total)}
              </strong>{' '}
              to {refundOrderTarget.customerName}.
            </p>
            <div>
              <label className="block text-xs font-medium mb-1">Refund Reason / Log Note</label>
              <textarea
                rows={3}
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundOrderTarget(null)}
                className="px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-700 text-white text-sm font-semibold hover:bg-rose-800 cursor-pointer"
              >
                Confirm Refund
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
