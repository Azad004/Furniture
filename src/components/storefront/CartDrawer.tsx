import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from '../common/SafeImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartOpen,
    setCartOpen,
    products,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    navigate,
    formatPrice,
  } = useStore();

  if (!cartOpen) return null;

  const freeShippingThreshold = 2500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Bag">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => setCartOpen(false)}
      />

      <aside
        className="relative w-full max-w-md h-full flex flex-col shadow-2xl border-l"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div
          className="px-6 py-5 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4" />
            <h2 className="font-display text-xl font-medium">Your Bag</h2>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close bag"
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-black/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free White-Glove Threshold */}
        <div
          className="px-6 py-3 text-xs border-b"
          style={{
            backgroundColor: 'var(--color-bg-surface-alt)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          {remainingForFreeShipping === 0 ? (
            <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Your order qualifies for complimentary White-Glove Delivery.
            </span>
          ) : (
            <span>
              Add{' '}
              <strong className="tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
                {formatPrice(remainingForFreeShipping)}
              </strong>{' '}
              more for complimentary White-Glove Delivery.
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <ShoppingBag className="w-10 h-10 opacity-25" strokeWidth={1.5} />
              <div className="space-y-1">
                <p className="font-display text-lg font-medium">Your bag is empty</p>
                <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Explore our architectural seating, dining tables, and hand-finished storage pieces.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  navigate({ page: 'shop', category: 'All' });
                }}
                className="vespera-btn-primary px-5 py-2.5 text-sm font-medium cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;

              return (
                <div
                  key={`${item.productId}-${item.finish}`}
                  className="flex gap-4 pb-5 border-b"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: 'var(--color-border)' }}>
                    <SafeImage
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-sm font-medium leading-snug truncate">
                          {product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.finish)}
                          aria-label={`Remove ${product.name}`}
                          className="p-1 opacity-55 hover:opacity-100 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {item.finish}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div
                        className="inline-flex items-center border rounded-md"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.finish, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/5 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCartQuantity(item.productId, item.finish, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold tabular-nums">
                        {formatPrice(product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div
            className="p-6 border-t space-y-4"
            style={{
              backgroundColor: 'var(--color-bg-surface-alt)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span className="text-lg font-semibold tabular-nums">
                {formatPrice(cartSubtotal)}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Delivery tier and payment options selected at checkout.
            </p>
            <button
              type="button"
              onClick={() => {
                setCartOpen(false);
                navigate({ page: 'checkout' });
              }}
              className="vespera-btn-primary w-full py-3 px-6 text-sm font-semibold cursor-pointer"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
