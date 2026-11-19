import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MosaicTile } from '../../types/store';
import { SafeImage } from '../common/SafeImage';

interface HotspotTileCardProps {
  tile: MosaicTile;
  activeSpotId: string;
  onSelectSpot: (id: string) => void;
  className?: string;
  bordered?: boolean;
}

export const HotspotTileCard: React.FC<HotspotTileCardProps> = ({
  tile,
  activeSpotId,
  onSelectSpot,
  className = '',
  bordered = true,
}) => {
  const { products, formatPrice, navigate } = useStore();

  return (
    <div
      className={`relative overflow-hidden group/tile min-h-0 ${
        bordered ? 'rounded-lg border' : ''
      } ${className}`}
      style={bordered ? { borderColor: 'var(--color-border)' } : undefined}
    >
      <SafeImage
        src={tile.image}
        alt={tile.alt}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/tile:scale-[1.02] ${
          tile.objectPositionClass || 'object-center'
        }`}
      />

      {tile.hotspots.map((spot) => {
        const product = products.find((p) => p.id === spot.productId);
        if (!product) return null;
        const isActive = activeSpotId === spot.id;
        const showBadge =
          spot.showBadge !== undefined ? spot.showBadge : product.newArrival;
        const badgeLabel = spot.badgeText?.trim() || 'New';
        const shortTitle =
          spot.customTitle?.trim() ||
          product.name.split(' ').slice(0, 1).join('').toUpperCase();
        const subTitle =
          spot.customSubtitle?.trim() ||
          product.name.split(' ').slice(1).join(' ') ||
          product.category;
        const displayPrice =
          spot.customPrice !== undefined && spot.customPrice > 0
            ? spot.customPrice
            : product.price;

        return (
          <React.Fragment key={spot.id}>
            <button
              type="button"
              onMouseEnter={() => onSelectSpot(spot.id)}
              onClick={() => onSelectSpot(spot.id)}
              aria-label={`Preview ${product.name}`}
              aria-expanded={isActive}
              style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-black/55 border-2 border-white scale-110 shadow-lg'
                  : 'bg-black/35 border border-white/80 hover:scale-110 hover:bg-black/55'
              }`}
            >
              <span
                className={`rounded-full transition-all ${
                  isActive ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-white/95'
                }`}
              />
            </button>

            {isActive && (
              <div
                onClick={() => navigate({ page: 'product', slug: product.slug })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate({ page: 'product', slug: product.slug });
                  }
                }}
                style={{
                  top: `${Math.min(72, Math.max(24, spot.yPercent))}%`,
                  ...(spot.cardSide === 'left'
                    ? { right: `calc(${100 - spot.xPercent}% + 20px)` }
                    : { left: `calc(${spot.xPercent}% + 20px)` }),
                }}
                className="absolute -translate-y-1/2 z-20 w-[195px] sm:w-[218px] bg-white text-[#1c1b19] shadow-[0_14px_34px_rgba(0,0,0,0.22)] border border-black/10 flex items-stretch text-left cursor-pointer hover:shadow-[0_16px_38px_rgba(0,0,0,0.28)] transition-shadow"
              >
                <div className="flex-1 min-w-0 p-3">
                  {showBadge && (
                    <p className="text-[11px] font-bold text-[#d95d1e] leading-none mb-1">
                      {badgeLabel}
                    </p>
                  )}
                  <p className="text-xs font-bold tracking-wide text-[#1c1b19] leading-tight truncate">
                    {shortTitle}
                  </p>
                  <p className="text-[11px] text-[#4b4741] leading-snug line-clamp-1 mt-0.5">
                    {subTitle}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-[#1c1b19] tabular-nums mt-1.5 leading-none">
                    {formatPrice(displayPrice)}
                  </p>
                </div>
                <span
                  className="w-8 shrink-0 border-l border-[#e6dfd5] flex items-center justify-center text-[#1c1b19] bg-white hover:bg-[#f6f3ee] transition-colors"
                  aria-hidden="true"
                >
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
