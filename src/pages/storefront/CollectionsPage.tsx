import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FurnitureCategory, MosaicTile, Product } from '../../types/store';
import { ProductCard } from '../../components/storefront/ProductCard';
import { HotspotTileCard } from '../../components/storefront/HotspotTileCard';
import { SafeImage } from '../../components/common/SafeImage';

interface CollectionRoom {
  id: string;
  edition: string;
  title: string;
  description: string;
  materials: string[];
  image: string;
  primaryCategory: FurnitureCategory;
  featuredProductIds: string[];
}

const ROOM_COLLECTIONS: CollectionRoom[] = [
  {
    id: 'col-living',
    edition: 'Collection 01',
    title: 'The Living Sanctuary',
    description:
      'Sculpted wool bouclé seating, deep Belgian flax sofas, modular corner silhouettes, and monolithic Roman travertine tables arranged for unhurried daylight.',
    materials: ['French Wool Bouclé', 'Roman Travertine', 'European White Oak'],
    image: '/src/assets/images/hero_lookcreative_living_1794926095098.jpg',
    primaryCategory: 'Sofas',
    featuredProductIds: ['prod-4', 'prod-1', 'prod-2', 'prod-18', 'prod-19', 'prod-20'],
  },
  {
    id: 'col-dining',
    edition: 'Collection 02',
    title: 'The Dining & Culinary Atelier',
    description:
      'Monumental American walnut plank tables, round travertine pedestals, hand-corded European white oak chairs, and fluted tambour sideboards.',
    materials: ['Smoked American Walnut', 'Hand-Corded Oak', 'Brushed Brass'],
    image: '/src/assets/images/hero_lookcreative_dining_1794926095951.jpg',
    primaryCategory: 'Kitchen',
    featuredProductIds: ['prod-7', 'prod-6', 'prod-3', 'prod-21', 'prod-22', 'prod-23'],
  },
  {
    id: 'col-bedroom',
    edition: 'Collection 03',
    title: 'Sanctuary Bedroom & Linen',
    description:
      'Low-profile interlocking oak and upholstered linen bed frames paired with fluted walnut nightstands, bouclé benches, and warm alabaster lighting.',
    materials: ['Solid White Oak', 'Unbleached Belgian Flax', 'Fluted Walnut'],
    image: '/src/assets/images/hero_lookcreative_bedroom_1794926094097.jpg',
    primaryCategory: 'Bedroom',
    featuredProductIds: ['prod-8', 'prod-11', 'prod-5', 'prod-24', 'prod-25', 'prod-26'],
  },
];

export const CollectionsPage: React.FC = () => {
  const { products, collectionTiles, navigate, formatPrice, addToCart } = useStore();

  const [selectedSpots, setSelectedSpots] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    collectionTiles.forEach((tile) => {
      if (tile.hotspots[0]) {
        initial[tile.id] = tile.hotspots[0].id;
      }
    });
    return initial;
  });

  useEffect(() => {
    setSelectedSpots((prev) => {
      let changed = false;
      const next = { ...prev };
      collectionTiles.forEach((tile) => {
        const current = next[tile.id];
        const exists = tile.hotspots.some((h) => h.id === current);
        if (!exists && tile.hotspots[0]) {
          next[tile.id] = tile.hotspots[0].id;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [collectionTiles]);

  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-16">
      <header className="max-w-3xl space-y-3 pb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Curated Architectural Editions
        </p>
        <h1 className="font-display headline-balance text-3xl sm:text-5xl font-medium leading-tight">
          Room Collections
        </h1>
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Cohesive interior ensembles designed to bring architectural calm across living rooms, dining halls, and restorative bedrooms.
        </p>
      </header>

      <div className="space-y-20">
        {ROOM_COLLECTIONS.map((col, idx) => {
          const collectionProducts = products
            .filter((p) => col.featuredProductIds.includes(p.id))
            .slice(0, 5);

          const tile: MosaicTile = collectionTiles.find((t) => t.id === col.id) ||
            collectionTiles[idx] || {
              id: col.id,
              label: col.title,
              image: col.image,
              alt: col.title,
              hotspots: [],
            };

          const activeSpotId = selectedSpots[tile.id] || tile.hotspots[0]?.id || '';

          const pinnedItems = tile.hotspots
            .map((spot) => {
              const product = products.find((p) => p.id === spot.productId);
              if (!product) return null;
              const displayPrice =
                spot.customPrice !== undefined && spot.customPrice > 0
                  ? spot.customPrice
                  : product.price;
              return { spot, product, displayPrice };
            })
            .filter(
              (entry): entry is { spot: (typeof tile.hotspots)[number]; product: Product; displayPrice: number } =>
                entry !== null
            );

          const ensembleTotal = pinnedItems.reduce((sum, item) => sum + item.displayPrice, 0);

          return (
            <section key={col.id} className="space-y-8">
              <div
                className="rounded-xl overflow-hidden border grid grid-cols-1 lg:grid-cols-12 items-stretch"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="lg:col-span-7 min-h-[360px] sm:min-h-[460px] lg:min-h-[560px] flex">
                  <HotspotTileCard
                    tile={tile}
                    activeSpotId={activeSpotId}
                    onSelectSpot={(spotId) =>
                      setSelectedSpots((prev) => ({ ...prev, [tile.id]: spotId }))
                    }
                    bordered={false}
                    className="w-full h-full min-h-[360px] sm:min-h-[460px] lg:min-h-[560px]"
                  />
                </div>

                <div className="lg:col-span-5 p-7 sm:p-9 flex flex-col justify-between gap-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span style={{ color: 'var(--color-brass)' }}>{col.edition}</span>
                        <span aria-hidden="true" style={{ color: 'var(--color-text-muted)' }}>
                          ·
                        </span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {pinnedItems.length} pinned pieces
                        </span>
                      </div>

                      <h2 className="font-display headline-balance text-2xl sm:text-3xl font-medium leading-snug">
                        {col.title}
                      </h2>

                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                        {col.description}
                      </p>

                      <p className="text-xs leading-relaxed pt-1" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Palette:{' '}
                        </span>
                        {col.materials.join(' · ')}
                      </p>
                    </div>

                    {pinnedItems.length > 0 && (
                      <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="flex items-baseline justify-between gap-2 mb-3">
                          <h3 className="text-xs font-semibold tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
                            Pieces in This Room
                          </h3>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Select to highlight pin
                          </span>
                        </div>

                        <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                          {pinnedItems.map(({ spot, product, displayPrice }, itemIdx) => {
                            const isActive = activeSpotId === spot.id;
                            return (
                              <li
                                key={spot.id}
                                onMouseEnter={() =>
                                  setSelectedSpots((prev) => ({ ...prev, [tile.id]: spot.id }))
                                }
                                style={{
                                  borderColor: 'var(--color-border)',
                                  backgroundColor: isActive ? 'var(--color-bg-surface-alt)' : 'transparent',
                                }}
                                className="flex items-center gap-3 py-2.5 px-2.5 -mx-2.5 rounded-lg transition-colors duration-150"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedSpots((prev) => ({ ...prev, [tile.id]: spot.id }))
                                  }
                                  className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-md"
                                  aria-pressed={isActive}
                                >
                                  <span
                                    className="text-xs font-semibold tabular-nums w-5 shrink-0"
                                    style={{
                                      color: isActive ? 'var(--color-brass)' : 'var(--color-text-muted)',
                                    }}
                                  >
                                    {String(itemIdx + 1).padStart(2, '0')}
                                  </span>

                                  <div
                                    className="w-11 h-11 rounded-md overflow-hidden shrink-0 border"
                                    style={{
                                      borderColor: 'var(--color-border)',
                                      backgroundColor: 'var(--color-bg-surface)',
                                    }}
                                  >
                                    <SafeImage
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-sm font-medium truncate"
                                      style={{ color: 'var(--color-text-primary)' }}
                                    >
                                      {product.name}
                                    </p>
                                    <p
                                      className="text-xs truncate"
                                      style={{ color: 'var(--color-text-muted)' }}
                                    >
                                      {product.material} · {product.category}
                                    </p>
                                  </div>
                                </button>

                                <span
                                  className="text-sm font-semibold tabular-nums shrink-0"
                                  style={{ color: 'var(--color-text-primary)' }}
                                >
                                  {formatPrice(displayPrice)}
                                </span>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => addToCart(product.id, product.finishes[0], 1, true)}
                                    title={`Add ${product.name} to bag`}
                                    aria-label={`Add ${product.name} to bag`}
                                    className="w-8 h-8 rounded-md flex items-center justify-center border transition-colors cursor-pointer hover:opacity-80"
                                    style={{
                                      borderColor: 'var(--color-border)',
                                      backgroundColor: 'var(--color-bg-surface)',
                                      color: 'var(--color-text-primary)',
                                    }}
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => navigate({ page: 'product', slug: product.slug })}
                                    title={`View ${product.name}`}
                                    aria-label={`View ${product.name}`}
                                    className="w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer hover:opacity-75"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div
                    className="pt-5 border-t flex flex-wrap items-center justify-between gap-4"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'shop', category: col.primaryCategory })}
                      className="vespera-btn-primary inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Shop {col.primaryCategory}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {ensembleTotal > 0 && (
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          Pinned Room Total
                        </p>
                        <p
                          className="text-base font-semibold tabular-nums"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {formatPrice(ensembleTotal)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {collectionProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} compact />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
};


