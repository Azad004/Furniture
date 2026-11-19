import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from '../../components/common/SafeImage';
import { ProductCard } from '../../components/storefront/ProductCard';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const {
    products,
    reviews,
    addToCart,
    submitReview,
    navigate,
    recordProductView,
    wishlistIds,
    toggleWishlist,
    formatPrice,
  } = useStore();

  const product = products.find((p) => p.slug === slug) || products[0];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState(product?.finishes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Review submission state
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedFinish(product.finishes[0] || 'Standard Finish');
      setQuantity(1);
      recordProductView(product.id);
    }
  }, [product?.id, recordProductView]);

  if (!product) {
    return (
      <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl">Piece not found</h1>
        <button
          type="button"
          onClick={() => navigate({ page: 'shop', category: 'All' })}
          className="vespera-btn-primary px-5 py-2.5 text-sm font-medium cursor-pointer"
        >
          Return to Catalog
        </button>
      </main>
    );
  }

  const productReviews = reviews.filter(
    (r) => r.productId === product.id && r.status === 'Approved'
  );
  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 5);

  const handleAddToBag = () => {
    addToCart(product.id, selectedFinish, quantity, true);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;
    submitReview({
      productId: product.id,
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || 'Verified Client',
      rating,
      comment: comment.trim(),
    });
    setAuthorName('');
    setAuthorRole('');
    setComment('');
    setRating(5);
    setReviewSubmitted(true);
  };

  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
      <button
        type="button"
        onClick={() => navigate({ page: 'shop', category: product.category })}
        className="inline-flex items-center gap-2 text-sm mb-8 hover:underline underline-offset-4 cursor-pointer"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {product.category}</span>
      </button>

      {/* Contiguous Gallery + Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Multi-Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border bg-white"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {(() => {
              const currentSrc = product.images[activeImageIndex] || product.images[0];
              const isCutout =
                currentSrc.includes('whitebg_') ||
                currentSrc.endsWith('.png') ||
                currentSrc.startsWith('data:image/png');
              return (
                <SafeImage
                  src={currentSrc}
                  alt={`${product.name} gallery view ${activeImageIndex + 1}`}
                  className={`w-full h-full ${
                    isCutout ? 'object-contain p-6 mix-blend-multiply' : 'object-cover'
                  }`}
                />
              );
            })()}

            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex(
                      (prev) => (prev - 1 + product.images.length) % product.images.length
                    )
                  }
                  aria-label="Previous product image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border text-[#1c1b19] flex items-center justify-center shadow-sm hover:bg-white cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev + 1) % product.images.length)
                  }
                  aria-label="Next product image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border text-[#1c1b19] flex items-center justify-center shadow-sm hover:bg-white cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
                <span
                  className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-white/90 border text-xs font-mono-tabular"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {activeImageIndex + 1} / {product.images.length}
                </span>
              </>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => {
                const thumbCutout =
                  img.includes('whitebg_') ||
                  img.endsWith('.png') ||
                  img.startsWith('data:image/png');
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-[4/3] rounded-lg overflow-hidden border bg-white transition-opacity cursor-pointer ${
                      idx === activeImageIndex ? 'ring-2 ring-[var(--color-accent)]' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className={`w-full h-full ${
                        thumbCutout ? 'object-contain p-1.5 mix-blend-multiply' : 'object-cover'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sticky Purchase Module */}
        <div
          className="lg:col-span-5 lg:sticky lg:top-24 rounded-xl border p-6 sm:p-8 space-y-6"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="space-y-2 border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
            <div className="text-xs flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span>{product.material}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">{product.sku}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-medium leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center justify-between pt-1">
              <p className="text-2xl font-semibold tabular-nums">
                {formatPrice(product.price)}
              </p>
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {product.stock > 0 ? `${product.stock} in studio stock` : 'Crafted to order'}
              </span>
            </div>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {product.description}
          </p>

          {/* Finish Selector */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold tracking-wide">
              Selected Finish
            </label>
            <div className="flex flex-col gap-2">
              {product.finishes.map((finish) => {
                const active = selectedFinish === finish;
                return (
                  <button
                    key={finish}
                    type="button"
                    onClick={() => setSelectedFinish(finish)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors cursor-pointer flex items-center justify-between ${
                      active ? 'font-medium' : 'hover:bg-black/5'
                    }`}
                    style={{
                      borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: active ? 'var(--color-bg-surface-alt)' : 'transparent',
                    }}
                  >
                    <span>{finish}</span>
                    {active && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-3 pt-1">
            <div
              className="inline-flex items-center border rounded-lg h-12"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-11 h-full flex items-center justify-center hover:bg-black/5 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-11 h-full flex items-center justify-center hover:bg-black/5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToBag}
              className="vespera-btn-primary flex-1 h-12 px-6 text-sm font-semibold cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {addedFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag — {formatPrice(product.price * quantity)}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={wishlistIds.includes(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-pressed={wishlistIds.includes(product.id)}
              title={wishlistIds.includes(product.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
              className={`w-12 h-12 rounded-lg border inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                wishlistIds.includes(product.id)
                  ? 'bg-[#fdf2ec] border-[#d99b78] text-[#b84a14]'
                  : 'hover:bg-black/5'
              }`}
              style={
                wishlistIds.includes(product.id)
                  ? undefined
                  : { borderColor: 'var(--color-border)' }
              }
            >
              <Heart className={`w-5 h-5 ${wishlistIds.includes(product.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Dimensions & Logistics */}
          <div className="pt-5 border-t space-y-3 text-xs" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between gap-4">
              <span style={{ color: 'var(--color-text-muted)' }}>Dimensions</span>
              <span className="font-medium text-right tabular-nums">{product.dimensions}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: 'var(--color-text-muted)' }}>Craftsmanship</span>
              <span className="text-right max-w-[260px]">{product.craftsmanshipNote}</span>
            </div>
            <div className="flex items-center gap-2 pt-2" style={{ color: 'var(--color-text-muted)' }}>
              <Truck className="w-4 h-4 shrink-0" />
              <span>{product.leadTime}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>10-year structural timber &amp; joinery guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews & Submission */}
      <section className="mt-20 pt-14 border-t grid grid-cols-1 lg:grid-cols-12 gap-12" style={{ borderColor: 'var(--color-border)' }}>
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-medium">Client Impressions</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Verified feedback from residential and architectural trade installations.
            </p>
          </div>

          {productReviews.length === 0 ? (
            <p className="text-sm py-6" style={{ color: 'var(--color-text-muted)' }}>
              Be the first client to share an impression of the {product.name}.
            </p>
          ) : (
            <div className="space-y-4">
              {productReviews.map((rev) => (
                <article
                  key={rev.id}
                  className="rounded-xl border p-5 space-y-3"
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-3.5 h-3.5 fill-current"
                          style={{ color: 'var(--color-brass)' }}
                        />
                      ))}
                    </div>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                      {rev.createdAt}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{rev.comment}</p>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{rev.authorName}</strong> ·{' '}
                    {rev.authorRole}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div
          className="lg:col-span-5 rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h3 className="font-display text-xl font-medium">Leave a Review</h3>
          {reviewSubmitted ? (
            <div
              className="p-4 rounded-lg text-sm space-y-2"
              style={{ backgroundColor: 'var(--color-bg-surface-alt)' }}
            >
              <p className="font-medium">Thank you for sharing your feedback.</p>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Your review has been submitted to our studio moderation queue and can be approved in the Admin Panel.
              </p>
              <button
                type="button"
                onClick={() => setReviewSubmitted(false)}
                className="text-xs underline underline-offset-4 cursor-pointer"
              >
                Write another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Camille Laurent"
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Role or City (Optional)</label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="e.g. Interior Architect · Austin"
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-[var(--color-bg-surface)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <option value={5}>5 Stars — Exceptional</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Satisfactory</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Your Review</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share thoughts on joinery, upholstery, or delivery..."
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              <button
                type="submit"
                className="vespera-btn-primary w-full py-2.5 text-sm font-semibold cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Related Products */}
      <section className="mt-20 pt-14 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="font-display text-2xl font-medium mb-8">Complementary Pieces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {relatedProducts.map((rel) => (
            <ProductCard key={rel.id} product={rel} compact />
          ))}
        </div>
      </section>
    </main>
  );
};
