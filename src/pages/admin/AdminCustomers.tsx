import React, { useState } from 'react';
import { History, Search, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Customer } from '../../types/store';

export const AdminCustomers: React.FC = () => {
  const { customers, orders, formatPrice } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const getCustomerStats = (customerId: string, email: string) => {
    const custOrders = orders.filter(
      (o) => o.customerId === customerId || o.customerEmail.toLowerCase() === email.toLowerCase()
    );
    const totalSpend = custOrders
      .filter((o) => o.status !== 'Refunded' && o.status !== 'Cancelled')
      .reduce((s, o) => s + o.total, 0);
    return { custOrders, totalSpend };
  };

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-medium">Customer Management</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Client directory, lifetime studio spend, and complete order history records.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client name, email, or city..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-[var(--color-bg-surface)]"
          style={{ borderColor: 'var(--color-border)' }}
        />
      </div>

      {/* Customers Table -> Stacked Mobile Cards */}
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
                <th>Client</th>
                <th>Location</th>
                <th>Joined</th>
                <th className="text-right">Orders</th>
                <th className="text-right">Lifetime Spend</th>
                <th className="text-right">History</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const { custOrders, totalSpend } = getCustomerStats(customer.id, customer.email);
                return (
                  <tr key={customer.id}>
                    <td data-primary="true">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {customer.email}
                        </p>
                      </div>
                    </td>
                    <td data-label="Location">{customer.city}</td>
                    <td data-label="Joined" className="font-mono-tabular text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {customer.joinedAt}
                    </td>
                    <td data-label="Orders" className="md:text-right font-mono-tabular">
                      {custOrders.length}
                    </td>
                    <td data-label="Lifetime Spend" className="md:text-right font-mono-tabular font-semibold">
                      {formatPrice(totalSpend)}
                    </td>
                    <td data-label="History" className="md:text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(customer)}
                        className="px-3 py-1.5 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 hover:bg-black/5 cursor-pointer"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Purchase History</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/45" onClick={() => setSelectedCustomer(null)} />
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border p-6 space-y-5 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <h2 className="font-display text-xl font-medium">{selectedCustomer.name}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {selectedCustomer.email} · {selectedCustomer.phone} · {selectedCustomer.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Order History
              </h3>
              {getCustomerStats(selectedCustomer.id, selectedCustomer.email).custOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-lg border p-4 space-y-2 text-sm"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tabular font-semibold">#{ord.orderNumber}</span>
                    <span className="text-xs font-medium">{ord.status}</span>
                  </div>
                  <div className="text-xs space-y-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {ord.items.map((it, i) => (
                      <p key={i}>
                        {it.quantity}× {it.productName} ({it.finish})
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t text-xs" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="font-mono-tabular" style={{ color: 'var(--color-text-muted)' }}>
                      {ord.createdAt}
                    </span>
                    <span className="font-mono-tabular font-semibold text-sm">
                      {formatPrice(ord.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
