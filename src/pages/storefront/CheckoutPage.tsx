import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types/store';
import { SafeImage } from '../../components/common/SafeImage';
import { isValidEmail, isValidPhone } from '../../utils/security';

export const CheckoutPage: React.FC = () => {
  const { cart, products, cartSubtotal, placeOrder, navigate, userProfile, formatPrice } = useStore();

  const [customerName, setCustomerName] = useState(userProfile?.name || '');
  const [customerEmail, setCustomerEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState(userProfile?.city || '');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryTier, setDeliveryTier] = useState<
    'White-Glove Assembly' | 'Threshold Delivery'
  >('White-Glove Assembly');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Cash on Delivery'>(
    'Credit Card'
  );
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const shippingFee =
    deliveryTier === 'White-Glove Assembly'
      ? cartSubtotal >= 2500
        ? 0
        : 195
      : cartSubtotal >= 1500
      ? 0
      : 95;
  const orderTotal = cartSubtotal + shippingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    if (cart.length === 0) return;

    if (customerName.trim().length < 2) {
      setCheckoutError('Please enter your full name.');
      return;
    }
    if (!isValidEmail(customerEmail)) {
      setCheckoutError('Please enter a valid email address for order confirmation.');
      return;
    }
    if (!isValidPhone(phone)) {
      setCheckoutError('Please enter a valid freight scheduling phone number (7–15 digits).');
      return;
    }
    if (street.trim().length < 4 || city.trim().length < 2 || postalCode.trim().length < 3) {
      setCheckoutError('Please complete your street address, city, and postal code.');
      return;
    }

    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock <= 0) {
        setCheckoutError('One or more items in your bag are currently out of stock.');
        return;
      }
      if (item.quantity > product.stock) {
        setCheckoutError(
          `Only ${product.stock} unit(s) of "${product.name}" remain in stock. Please adjust your bag.`
        );
        return;
      }
    }

    const order = placeOrder({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      deliveryTier,
      paymentMethod,
    });
    setConfirmedOrder(order);
  };

  if (confirmedOrder) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div
          className="rounded-xl border p-8 sm:p-10 space-y-6"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-700 shrink-0" />
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Order Confirmation
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-medium">
                Order #{confirmedOrder.orderNumber} Confirmed
              </h1>
            </div>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Thank you, {confirmedOrder.customerName}. Our studio dispatch coordinator is preparing your pieces for{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {confirmedOrder.deliveryTier}
            </strong>{' '}
            to {confirmedOrder.shippingAddress}.
          </p>

          <div
            className="rounded-lg border divide-y text-sm"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {item.finish} · Qty {item.quantity}
                  </p>
                </div>
                <span className="font-semibold tabular-nums">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
            <div className="p-4 flex items-center justify-between font-semibold text-base">
              <span>Total ({confirmedOrder.paymentMethod})</span>
              <span className="tabular-nums">{formatPrice(confirmedOrder.total)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() =>
                navigate({ page: 'track', orderNumber: confirmedOrder.orderNumber })
              }
              className="vespera-btn-primary px-6 py-3 text-sm font-semibold cursor-pointer"
            >
              Track Order Status
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'shop', category: 'All' })}
              className="px-5 py-3 rounded-lg border text-sm font-medium hover:bg-black/5 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <h1 className="font-display text-3xl font-medium">Your Shopping Bag is Empty</h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
          Select furniture pieces from our catalog before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={() => navigate({ page: 'shop', category: 'All' })}
          className="vespera-btn-primary px-6 py-3 text-sm font-semibold cursor-pointer"
        >
          Explore Catalog
        </button>
      </main>
    );
  }

  return (
    <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <button
        type="button"
        onClick={() => navigate({ page: 'shop', category: 'All' })}
        className="inline-flex items-center gap-2 text-sm mb-8 hover:underline underline-offset-4 cursor-pointer"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalog</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-medium">Studio Checkout</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Distraction-free dispatch scheduling and payment verification.
            </p>
          </div>

          {/* 1. Client Details */}
          <section
            className="rounded-xl border p-6 space-y-4"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h2 className="font-display text-lg font-medium">1. Client &amp; Delivery Address</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="elena@studio.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Phone Number (Freight Scheduling)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (415) 555-0192"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="480 Jackson Street, Apt 4A"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">City &amp; State</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="94111"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
            </div>
          </section>

          {/* 2. Delivery Service */}
          <section
            className="rounded-xl border p-6 space-y-4"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h2 className="font-display text-lg font-medium">2. Delivery Tier</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    tier: 'White-Glove Assembly',
                    desc: 'In-room placement, assembly & packaging removal',
                    fee: cartSubtotal >= 2500 ? 'Complimentary' : formatPrice(195),
                  },
                  {
                    tier: 'Threshold Delivery',
                    desc: 'Scheduled curbside or covered entryway drop-off',
                    fee: cartSubtotal >= 1500 ? 'Complimentary' : formatPrice(95),
                  },
                ] as const
              ).map((option) => {
                const active = deliveryTier === option.tier;
                return (
                  <button
                    key={option.tier}
                    type="button"
                    onClick={() => setDeliveryTier(option.tier)}
                    className="text-left p-4 rounded-lg border transition-colors cursor-pointer space-y-1"
                    style={{
                      borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: active ? 'var(--color-bg-surface-alt)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{option.tier}</span>
                      <span className="tabular-nums">{option.fee}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {option.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Payment Method */}
          <section
            className="rounded-xl border p-6 space-y-4"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h2 className="font-display text-lg font-medium">3. Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['Credit Card', 'Cash on Delivery'] as const).map((method) => {
                const active = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className="text-left p-4 rounded-lg border transition-colors cursor-pointer space-y-1"
                    style={{
                      borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: active ? 'var(--color-bg-surface-alt)' : 'transparent',
                    }}
                  >
                    <p className="text-sm font-semibold">{method}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {method === 'Credit Card'
                        ? 'Encrypted immediate authorization'
                        : 'Pay courier upon physical inspection'}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {checkoutError && (
            <p
              role="alert"
              className="rounded-lg border px-4 py-3 text-xs sm:text-sm font-medium text-rose-800 bg-rose-50 border-rose-200"
            >
              {checkoutError}
            </p>
          )}

          <button
            type="submit"
            className="vespera-btn-primary w-full py-4 px-6 text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Place Order — {formatPrice(orderTotal)}</span>
          </button>
        </form>

        {/* Right Itemized Order Summary */}
        <aside
          className="lg:col-span-5 rounded-xl border p-6 space-y-5 lg:sticky lg:top-24"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h2 className="font-display text-xl font-medium">Order Summary</h2>

          <div className="space-y-4 divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;
              return (
                <div
                  key={`${item.productId}-${item.finish}`}
                  className="pt-4 first:pt-0 flex items-center gap-4"
                >
                  <div className="w-16 h-14 rounded-md overflow-hidden border shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                    <SafeImage
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {item.finish} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(product.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t space-y-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span className="tabular-nums">{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>{deliveryTier}</span>
              <span className="tabular-nums">
                {shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}
              </span>
            </div>
            <div
              className="pt-3 border-t flex justify-between text-base font-semibold"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(orderTotal)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs pt-2" style={{ color: 'var(--color-text-muted)' }}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Protected by our 30-day residential trial &amp; 10-year joinery warranty.</span>
          </div>
        </aside>
      </div>
    </main>
  );
};
