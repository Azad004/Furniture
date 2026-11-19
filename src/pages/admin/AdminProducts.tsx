import React, { useMemo, useState } from 'react';
import { Edit2, Eye, Package, Plus, Search, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from '../../components/common/SafeImage';

export const AdminProducts: React.FC = () => {
  const {
    products,
    orders,
    productViewCounts,
    deleteProduct,
    formatPrice,
    navigate,
  } = useStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'views-desc' | 'orders-desc' | 'stock-asc'>('default');

  const productOrderStats = useMemo(() => {
    const map: Record<string, { userOrders: number; unitsSold: number; customers: Set<string> }> = {};
    orders.forEach((order) => {
      if (order.status === 'Cancelled' || order.status === 'Refunded') return;
      const seenInOrder = new Set<string>();
      order.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = { userOrders: 0, unitsSold: 0, customers: new Set() };
        }
        map[item.productId].unitsSold += item.quantity;
        if (!seenInOrder.has(item.productId)) {
          map[item.productId].userOrders += 1;
          seenInOrder.add(item.productId);
        }
        map[item.productId].customers.add(order.customerEmail.toLowerCase());
      });
    });
    return map;
  }, [orders]);

  const totalCatalogViews = useMemo(
    () => products.reduce((sum, p) => sum + (productViewCounts[p.id] || 0), 0),
    [products, productViewCounts]
  );

  const totalOrderedUnits = useMemo(
    () =>
      Object.values(productOrderStats).reduce((sum, stat) => sum + stat.unitsSold, 0),
    [productOrderStats]
  );

  const totalOrderPlacements = useMemo(
    () =>
      Object.values(productOrderStats).reduce((sum, stat) => sum + stat.userOrders, 0),
    [productOrderStats]
  );

  const topViewedProduct = useMemo(() => {
    if (products.length === 0) return null;
    return products.reduce((best, p) =>
      (productViewCounts[p.id] || 0) > (productViewCounts[best.id] || 0) ? p : best
    , products[0]);
  }, [products, productViewCounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'views-desc') {
      return [...list].sort(
        (a, b) => (productViewCounts[b.id] || 0) - (productViewCounts[a.id] || 0)
      );
    }
    if (sortBy === 'orders-desc') {
      return [...list].sort(
        (a, b) =>
          (productOrderStats[b.id]?.userOrders || 0) -
          (productOrderStats[a.id]?.userOrders || 0)
      );
    }
    if (sortBy === 'stock-asc') {
      return [...list].sort((a, b) => a.stock - b.stock);
    }
    return list;
  }, [products, search, sortBy, productViewCounts, productOrderStats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">Product Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage catalog pieces, studio stock levels, user views, user orders, and photography uploads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'products', productMode: 'new' })}
          className="vespera-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Piece</span>
        </button>
      </div>

      {/* Product Analytics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          className="rounded-xl border p-4 sm:p-5 space-y-1.5"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Total Products</span>
            <Package className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">{products.length}</p>
        </div>

        <div
          className="rounded-xl border p-4 sm:p-5 space-y-1.5"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Total User Views</span>
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">
            {totalCatalogViews.toLocaleString('en-US')}
          </p>
        </div>

        <div
          className="rounded-xl border p-4 sm:p-5 space-y-1.5"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Total User Orders</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="text-2xl font-semibold font-mono-tabular">
            {totalOrderPlacements}{' '}
            <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>
              ({totalOrderedUnits} units)
            </span>
          </p>
        </div>

        <div
          className="rounded-xl border p-4 sm:p-5 space-y-1.5"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Most Viewed Piece</span>
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-base font-semibold truncate">
            {topViewedProduct ? topViewedProduct.name : '—'}
          </p>
          <p className="text-xs font-mono-tabular" style={{ color: 'var(--color-text-muted)' }}>
            {topViewedProduct
              ? `${(productViewCounts[topViewedProduct.id] || 0).toLocaleString('en-US')} views`
              : 'No views yet'}
          </p>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by piece name, SKU, or category..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-[var(--color-bg-surface)]"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          aria-label="Sort products by analytics"
          className="px-3.5 py-2 text-sm rounded-lg border bg-[var(--color-bg-surface)] cursor-pointer w-fit"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <option value="default">Sort: Catalog Order</option>
          <option value="views-desc">Sort: Most Viewed</option>
          <option value="orders-desc">Sort: Most Ordered</option>
          <option value="stock-asc">Sort: Lowest Stock</option>
        </select>
      </div>

      {/* Products Data Table -> Stacked Mobile Cards */}
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
                <th>#</th>
                <th>Piece</th>
                <th>SKU</th>
                <th>Category</th>
                <th className="text-right">User Views</th>
                <th className="text-right">User Orders</th>
                <th className="text-right">Price</th>
                <th className="text-right">Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, index) => {
                const viewCount = productViewCounts[product.id] || 0;
                const orderStat = productOrderStats[product.id] || {
                  userOrders: 0,
                  unitsSold: 0,
                  customers: new Set<string>(),
                };
                return (
                  <tr key={product.id}>
                    <td data-label="#" className="font-mono-tabular text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {index + 1}
                    </td>
                    <td data-primary="true">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-10 rounded-md overflow-hidden border bg-white shrink-0"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <SafeImage
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-contain p-0.5 mix-blend-multiply"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              navigate({
                                page: 'admin',
                                module: 'products',
                                productMode: 'edit',
                                productId: product.id,
                              })
                            }
                            className="font-medium leading-snug block text-left hover:underline cursor-pointer"
                          >
                            {product.name}
                          </button>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {product.material} · {product.images.length}{' '}
                            {product.images.length === 1 ? 'photo' : 'photos'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td data-label="SKU" className="font-mono-tabular text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {product.sku}
                    </td>
                    <td data-label="Category">{product.category}</td>
                    <td data-label="User Views" className="md:text-right font-mono-tabular">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <Eye className="w-3.5 h-3.5 opacity-60" />
                        <span>{viewCount.toLocaleString('en-US')}</span>
                      </span>
                    </td>
                    <td data-label="User Orders" className="md:text-right font-mono-tabular">
                      <div className="md:text-right text-right">
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <ShoppingBag className="w-3.5 h-3.5 opacity-60" />
                          <span>{orderStat.userOrders}</span>
                        </span>
                        <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {orderStat.unitsSold} {orderStat.unitsSold === 1 ? 'unit' : 'units'}
                        </span>
                      </div>
                    </td>
                    <td data-label="Price" className="md:text-right font-mono-tabular font-semibold">
                      {formatPrice(product.price)}
                    </td>
                    <td data-label="Stock" className="md:text-right font-mono-tabular">
                      <span className={product.stock <= 5 ? 'text-amber-700 font-semibold' : ''}>
                        {product.stock} units
                      </span>
                    </td>
                    <td data-label="Actions" className="md:text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate({
                              page: 'admin',
                              module: 'products',
                              productMode: 'edit',
                              productId: product.id,
                            })
                          }
                          aria-label={`Edit ${product.name}`}
                          className="px-3 py-1.5 rounded-md border text-xs font-medium inline-flex items-center gap-1 hover:bg-black/5 cursor-pointer"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product.id)}
                          aria-label={`Delete ${product.name}`}
                          className="px-2.5 py-1.5 rounded-md border text-xs text-rose-700 hover:bg-rose-50 cursor-pointer"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

