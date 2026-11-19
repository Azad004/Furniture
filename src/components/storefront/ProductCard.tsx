import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/store';
import { SafeImage } from '../common/SafeImage';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { navigate, addToCart, formatPrice, wishlistIds, toggleWishlist } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const images = product.images.length > 0 ? product.images : [''];
  const currentImage = images[activeImgIdx] || images[0];
  const isWhiteBgCutout = currentImage.includes('whitebg_') || currentImage.endsWith('.png') || currentImage.startsWith('data:image/png');
  const wishlisted = wishlistIds.includes(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, product.finishes[0], 1, true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev + 1) % images.length);
  };

  return (
    <article
      onClick={() => navigate({ page: 'product', slug: product.slug })}
      className="vespera-card group overflow-hidden flex flex-col cursor-pointer min-w-0"
    >
      {/* Pure White Studio Frame for PNG / White-Bg Isolated Product Cutouts + Multi-Image Switcher */}
      <div
        className={`vespera-card-media relative w-full overflow-hidden bg-white ${
          compact ? 'aspect-square' : 'aspect-[4/3]'
        }`}
      >
        <SafeImage
          src={currentImage}
          alt={`${product.name} — view ${activeImgIdx + 1}`}
          className={`w-full h-full ${
            isWhiteBgCutout
              ? compact
                ? 'object-contain p-2 mix-blend-multiply'
                : 'object-contain p-3 mix-blend-multiply'
              : 'object-cover'
          }`}
        />

        {/* Multi-image navigation arrows (appear on hover) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label={`Previous image of ${product.name}`}
              className={`opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border text-[#1c1b19] flex items-center justify-center shadow-sm hover:bg-white cursor-pointer ${
                compact ? 'w-6 h-6' : 'w-8 h-8 left-2'
              }`}
              style={{ borderColor: 'var(--color-border)' }}
            >
              <ChevronLeft className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label={`Next image of ${product.name}`}
              className={`opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border text-[#1c1b19] flex items-center justify-center shadow-sm hover:bg-white cursor-pointer ${
                compact ? 'w-6 h-6' : 'w-8 h-8 right-2'
              }`}
              style={{ borderColor: 'var(--color-border)' }}
            >
              <ChevronRight className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
            </button>

            {/* Interactive dot indicators */}
            <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImgIdx(idx);
                  }}
                  aria-label={`View angle ${idx + 1} of ${product.name}`}
                  className={`rounded-full transition-all cursor-pointer ${
                    compact ? 'h-1' : 'h-1.5'
                  } ${
                    idx === activeImgIdx
                      ? compact
                        ? 'w-3 bg-[#1c1b19]'
                        : 'w-4 bg-[#1c1b19]'
                      : compact
                      ? 'w-1 bg-[#1c1b19]/25 hover:bg-[#1c1b19]/55'
                      : 'w-1.5 bg-[#1c1b19]/25 hover:bg-[#1c1b19]/55'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div
        className={`flex-1 flex flex-col justify-between border-t ${
          compact ? 'p-3 gap-2.5' : 'p-5 gap-4'
        }`}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className={compact ? 'space-y-1 min-w-0' : 'space-y-1.5 min-w-0'}>
          {/* Zero-pill clean unboxed metadata */}
          <div
            className={`flex items-center gap-1.5 truncate ${
              compact ? 'text-[11px]' : 'text-xs gap-2'
            }`}
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span className="truncate">{product.category}</span>
            {!compact && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{product.material}</span>
              </>
            )}
          </div>

          <h3
            className={`font-display font-medium leading-snug group-hover:underline underline-offset-4 line-clamp-2 ${
              compact ? 'text-sm min-h-[2.4rem]' : 'text-base sm:text-lg min-h-[3.1rem]'
            }`}
            style={{ color: 'var(--color-text-primary)' }}
          >
            {product.name}
          </h3>
        </div>

        <div
          className={`flex items-center justify-between pt-2 border-t ${
            compact ? 'gap-1.5' : 'gap-3'
          }`}
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="space-y-0.5 min-w-0">
            <p
              className={`font-semibold tabular-nums truncate ${
                compact ? 'text-xs sm:text-sm' : 'text-base'
              }`}
              style={{ color: 'var(--color-text-primary)' }}
            >
              {formatPrice(product.price)}
            </p>
            <p
              className={`truncate ${compact ? 'text-[10px]' : 'text-xs'}`}
              style={{ color: 'var(--color-text-muted)' }}
            >
              {product.stock > 0 ? 'In Stock' : 'Made to Order'}
            </p>
          </div>

          <div className={`flex items-center shrink-0 ${compact ? 'gap-1' : 'gap-2'}`}>
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
              aria-pressed={wishlisted}
              title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={`rounded-lg border inline-flex items-center justify-center transition-colors cursor-pointer ${
                compact ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-10 h-10'
              } ${
                wishlisted
                  ? 'bg-[#fdf2ec] border-[#d99b78] text-[#b84a14]'
                  : 'hover:bg-black/5'
              }`}
              style={
                wishlisted
                  ? undefined
                  : {
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }
              }
            >
              <Heart className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${wishlisted ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              aria-label={justAdded ? `${product.name} added to bag` : `Add ${product.name} to bag`}
              title={justAdded ? 'Added to Bag' : 'Add to Bag'}
              className={`vespera-btn-primary rounded-lg inline-flex items-center justify-center cursor-pointer disabled:opacity-45 ${
                compact ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-10 h-10'
              }`}
            >
              {justAdded ? (
                <Check className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
              ) : (
                <ShoppingBag className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
