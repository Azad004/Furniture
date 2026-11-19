import React, { useEffect, useMemo, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ALL_CATEGORIES, FurnitureCategory, MaterialType } from '../../types/store';
import { ProductCard } from '../../components/storefront/ProductCard';

interface ShopPageProps {
  initialCategory?: FurnitureCategory | 'All';
  initialQuery?: string;
}

const CATEGORIES: Array<FurnitureCategory | 'All'> = ['All', ...ALL_CATEGORIES];

const MATERIALS: Array<MaterialType | 'All'> = [
  'All',
  'Solid White Oak',
  'American Walnut',
  'Belgian Linen',
  'Ivory Bouclé',
  'Honed Travertine',
  'Brushed Brass',
];

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = 'All',
  initialQuery = '',
}) => {
  const { products, formatPrice } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<FurnitureCategory | 'All'>(
    initialCategory
  );
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | 'All'>('All');
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(true);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products
      .filter((p) => {
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
        if (selectedMaterial !== 'All' && p.material !== selectedMaterial) return false;
        if (p.price > maxPrice) return false;
        if (
          q &&
          !p.name.toLowerCase().includes(q) &&
          !p.material.toLowerCase().includes(q) &&
          !p.category.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return Number(b.bestSeller) - Number(a.bestSeller);
      });
  }, [products, selectedCategory, selectedMaterial, maxPrice, searchQuery, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedMaterial('All');
    setMaxPrice(6000);
    setSearchQuery('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedMaterial !== 'All' ||
    maxPrice < 6000 ||
    searchQuery.trim() !== '';

  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
      {/* Page Header */}
      <div className="pb-8 border-b space-y-3" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Catalog · {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="font-display text-3xl sm:text-4xl font-medium">
            {selectedCategory === 'All' ? 'Architectural Furniture Catalog' : selectedCategory}
          </h1>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:flex-initial min-w-[220px]">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pieces or materials..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-[var(--color-bg-surface)]"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort products"
              className="px-3 py-2 text-sm rounded-lg border bg-[var(--color-bg-surface)] cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="featured">Sort: Curated Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            {!desktopFiltersOpen && (
              <button
                type="button"
                onClick={() => setDesktopFiltersOpen(true)}
                title="Show filters"
                aria-label="Show filters"
                className="hidden lg:inline-flex items-center justify-center p-2.5 rounded-lg border cursor-pointer hover:bg-black/5 transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <PanelLeftOpen className="w-[18px] h-[18px]" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg border cursor-pointer"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg-surface)',
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <aside
          className={`space-y-8 ${mobileFiltersOpen ? 'block' : 'hidden'} ${
            desktopFiltersOpen ? 'lg:block lg:col-span-3' : 'lg:hidden'
          }`}
        >
          {/* Category Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Category
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
                    setDesktopFiltersOpen(false);
                  } else {
                    setMobileFiltersOpen(false);
                  }
                }}
                title="Hide filters"
                aria-label="Hide filters"
                className="p-1.5 rounded-lg border transition-colors hover:bg-black/5 cursor-pointer"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-3.5 py-2.5 rounded-lg text-base transition-colors cursor-pointer ${
                      active ? 'font-semibold' : 'hover:bg-black/5'
                    }`}
                    style={{
                      backgroundColor: active ? 'var(--color-bg-surface-alt)' : 'transparent',
                      color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material Filter */}
          <div className="space-y-3 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Primary Material
            </h2>
            <div className="flex flex-col gap-1">
              {MATERIALS.map((mat) => {
                const active = selectedMaterial === mat;
                return (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => setSelectedMaterial(mat)}
                    className={`text-left px-3.5 py-2.5 rounded-lg text-base transition-colors cursor-pointer ${
                      active ? 'font-semibold' : 'hover:bg-black/5'
                    }`}
                    style={{
                      backgroundColor: active ? 'var(--color-bg-surface-alt)' : 'transparent',
                      color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    }}
                  >
                    {mat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Max Price
              </span>
              <span className="font-semibold tabular-nums">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={6000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)] cursor-pointer"
            />
            <div className="flex justify-between text-sm tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
              <span>{formatPrice(500)}</span>
              <span>{formatPrice(6000)}+</span>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Reset All Filters</span>
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <section className={desktopFiltersOpen ? 'lg:col-span-9' : 'lg:col-span-12'}>
          {filteredProducts.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center space-y-4"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h2 className="font-display text-xl font-medium">No matching pieces found</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                Adjust your selected material, category, or maximum price threshold to view available pieces.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="vespera-btn-primary px-5 py-2.5 text-sm font-medium cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} compact />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
