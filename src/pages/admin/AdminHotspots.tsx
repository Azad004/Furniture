import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Eye,
  Image as ImageIcon,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { MosaicHotspot, MosaicTile } from '../../types/store';
import { SafeImage } from '../../components/common/SafeImage';
import { resolveAssetUrl, sanitizeImageUrl, validateAndReadImageFile } from '../../utils/security';

type MosaicSectionKey = 'bestSellers' | 'shopLook' | 'collections';

const STUDIO_IMAGE_PRESETS = [
  { label: 'Living Sanctuary', src: '/src/assets/images/hero_lookcreative_living_1794926095098.jpg' },
  { label: 'Master Bedroom', src: '/src/assets/images/hero_lookcreative_bedroom_1794926094097.jpg' },
  { label: 'Architectural Dining', src: '/src/assets/images/hero_lookcreative_dining_1794926095951.jpg' },
  { label: 'Bouclé Lounge', src: '/src/assets/images/product_boucle_lounge_1794926095999.jpg' },
  { label: 'Travertine Salon', src: '/src/assets/images/product_travertine_table_1794926096128.jpg' },
  { label: 'Walnut Credenza', src: '/src/assets/images/product_walnut_credenza_1794926094553.jpg' },
  { label: 'Linen Sofa', src: '/src/assets/images/product_linen_sofa_1794926095674.jpg' },
  { label: 'Brass Floor Lamp', src: '/src/assets/images/product_brass_floor_lamp_1794926095796.jpg' },
  { label: 'Oak Dining Chair', src: '/src/assets/images/product_oak_dining_chair_1794926097049.jpg' },
  { label: 'SF Jackson Gallery', src: '/src/assets/images/showroom_sf_gallery_1794990927911.jpg' },
  { label: 'NY SoHo Loft', src: '/src/assets/images/showroom_ny_loft_1794990929170.jpg' },
  { label: 'Copenhagen Studio', src: '/src/assets/images/showroom_cph_studio_1794990929649.jpg' },
];

export const AdminHotspots: React.FC = () => {
  const {
    products,
    bestSellersTiles,
    shopLookTiles,
    collectionTiles,
    updateBestSellersTiles,
    updateShopLookTiles,
    updateCollectionTiles,
    resetMosaicTiles,
    formatPrice,
    navigate,
  } = useStore();

  const [activeSection, setActiveSection] = useState<MosaicSectionKey>('bestSellers');
  const [selectedTileId, setSelectedTileId] = useState<string>(
    () => bestSellersTiles[0]?.id || ''
  );
  const [selectedPinId, setSelectedPinId] = useState<string>(
    () => bestSellersTiles[0]?.hotspots[0]?.id || ''
  );
  const [canvasClickMode, setCanvasClickMode] = useState<'move' | 'add'>('move');
  const [showTileSettings, setShowTileSettings] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');

  const canvasRef = useRef<HTMLDivElement>(null);
  const productPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!productPickerOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        productPickerRef.current &&
        !productPickerRef.current.contains(e.target as Node)
      ) {
        setProductPickerOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProductPickerOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [productPickerOpen]);

  const getSectionTiles = (section: MosaicSectionKey) =>
    section === 'bestSellers'
      ? bestSellersTiles
      : section === 'shopLook'
        ? shopLookTiles
        : collectionTiles;

  const tiles = getSectionTiles(activeSection);
  const notifyToast = (toastMsg: string) => {
    setSavedToast(toastMsg);
    window.setTimeout(() => setSavedToast(null), 2600);
  };

  const saveTiles = (nextTiles: MosaicTile[], toastMsg?: string) => {
    if (activeSection === 'bestSellers') {
      updateBestSellersTiles(nextTiles);
    } else if (activeSection === 'shopLook') {
      updateShopLookTiles(nextTiles);
    } else {
      updateCollectionTiles(nextTiles);
    }
    if (toastMsg) {
      notifyToast(toastMsg);
    }
  };

  const activeTile = tiles.find((t) => t.id === selectedTileId) || tiles[0];
  const activePin =
    activeTile?.hotspots.find((h) => h.id === selectedPinId) ||
    activeTile?.hotspots[0] ||
    null;

  // Keep selectedTileId & selectedPinId valid when switching sections or tiles
  useEffect(() => {
    const currentTiles =
      activeSection === 'bestSellers'
        ? bestSellersTiles
        : activeSection === 'shopLook'
          ? shopLookTiles
          : collectionTiles;
    const tileMatch = currentTiles.find((t) => t.id === selectedTileId) || currentTiles[0];
    if (tileMatch && tileMatch.id !== selectedTileId) {
      setSelectedTileId(tileMatch.id);
      setSelectedPinId(tileMatch.hotspots[0]?.id || '');
      return;
    }
    if (tileMatch && tileMatch.hotspots.length > 0) {
      const hasPin = tileMatch.hotspots.some((h) => h.id === selectedPinId);
      if (!hasPin) {
        setSelectedPinId(tileMatch.hotspots[0].id);
      }
    } else {
      setSelectedPinId('');
    }
  }, [
    activeSection,
    bestSellersTiles,
    shopLookTiles,
    collectionTiles,
    selectedTileId,
    selectedPinId,
  ]);

  const handleSelectSection = (section: MosaicSectionKey) => {
    setActiveSection(section);
    const nextTiles = getSectionTiles(section);
    setSelectedTileId(nextTiles[0]?.id || '');
    setSelectedPinId(nextTiles[0]?.hotspots[0]?.id || '');
  };

  const handleSelectTile = (tile: MosaicTile) => {
    setSelectedTileId(tile.id);
    setSelectedPinId(tile.hotspots[0]?.id || '');
  };

  const updateActiveTile = (updater: (tile: MosaicTile) => MosaicTile, toastMsg?: string) => {
    if (!activeTile) return;
    const next = tiles.map((t) => (t.id === activeTile.id ? updater(t) : t));
    saveTiles(next, toastMsg);
  };

  const updateActivePin = (patch: Partial<MosaicHotspot>) => {
    if (!activeTile || !activePin) return;
    updateActiveTile((tile) => ({
      ...tile,
      hotspots: tile.hotspots.map((h) => (h.id === activePin.id ? { ...h, ...patch } : h)),
    }));
  };

  const handleTileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeTile) return;
    const result = await validateAndReadImageFile(file);
    if (!result.ok) {
      notifyToast(result.error);
      return;
    }
    updateActiveTile(
      (tile) => ({ ...tile, image: result.dataUrl }),
      `Updated image for ${activeTile.label}`
    );
  };

  const handleAddPinAt = (xPercent = 50, yPercent = 50) => {
    if (!activeTile || products.length === 0) return;
    const defaultProduct = products[0];
    const newId = `pin-${Date.now()}`;
    const newPin: MosaicHotspot = {
      id: newId,
      productId: defaultProduct.id,
      xPercent,
      yPercent,
      cardSide: xPercent > 58 ? 'left' : 'right',
    };
    updateActiveTile(
      (tile) => ({
        ...tile,
        hotspots: [...tile.hotspots, newPin],
      }),
      'New pin point added'
    );
    setSelectedPinId(newId);
    setCanvasClickMode('move');
  };

  const handleDeletePin = (pinId: string) => {
    if (!activeTile) return;
    const remaining = activeTile.hotspots.filter((h) => h.id !== pinId);
    updateActiveTile(
      (tile) => ({
        ...tile,
        hotspots: remaining,
      }),
      'Pin point removed'
    );
    setSelectedPinId(remaining[0]?.id || '');
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !activeTile) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const xPercent = Math.min(96, Math.max(4, Math.round(rawX)));
    const yPercent = Math.min(96, Math.max(4, Math.round(rawY)));

    if (canvasClickMode === 'add' || !activePin) {
      handleAddPinAt(xPercent, yPercent);
    } else {
      updateActivePin({ xPercent, yPercent });
    }
  };

  const activeProduct = activePin
    ? products.find((p) => p.id === activePin.productId) || products[0]
    : null;

  const autoHeadline = activeProduct
    ? activeProduct.name.split(' ').slice(0, 1).join('').toUpperCase()
    : 'VESPERA';
  const autoSubtitle = activeProduct
    ? activeProduct.name.split(' ').slice(1).join(' ') || activeProduct.category
    : 'Signature Piece';

  const resolvedShowBadge = activePin
    ? activePin.showBadge !== undefined
      ? activePin.showBadge
      : Boolean(activeProduct?.newArrival)
    : false;

  const handleResetOverrides = () => {
    if (!activePin) return;
    updateActivePin({
      showBadge: undefined,
      badgeText: undefined,
      customTitle: undefined,
      customSubtitle: undefined,
      customPrice: undefined,
    });
    setSavedToast('Reset details to linked product defaults');
    window.setTimeout(() => setSavedToast(null), 2200);
  };

  const totalPinsCount = tiles.reduce((sum, tile) => sum + tile.hotspots.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">
            Pin Points &amp; Lookbook Details
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Place interactive room pin points, link catalog products, and customize floating popover titles, badges, and pricing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {savedToast && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
              <Check className="w-3.5 h-3.5" />
              <span>{savedToast}</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              resetMosaicTiles(activeSection);
              setSavedToast('Section pins restored to defaults');
              window.setTimeout(() => setSavedToast(null), 2200);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Section Defaults</span>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate({ page: activeSection === 'collections' ? 'collections' : 'home' })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>
              {activeSection === 'collections' ? 'Preview Collections' : 'Preview Storefront'}
            </span>
          </button>
        </div>
      </div>

      {/* Section Selector + Tile Strip */}
      <section
        className="rounded-xl border p-4 sm:p-5 space-y-4"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex flex-wrap p-1 rounded-lg border gap-1"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-surface-alt)',
            }}
          >
            <button
              type="button"
              onClick={() => handleSelectSection('bestSellers')}
              className="px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              style={{
                backgroundColor:
                  activeSection === 'bestSellers' ? 'var(--color-accent)' : 'transparent',
                color:
                  activeSection === 'bestSellers'
                    ? 'var(--color-accent-contrast)'
                    : 'var(--color-text-muted)',
              }}
            >
              Best Sellers Mosaic ({bestSellersTiles.reduce((s, t) => s + t.hotspots.length, 0)} pins)
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection('shopLook')}
              className="px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              style={{
                backgroundColor:
                  activeSection === 'shopLook' ? 'var(--color-accent)' : 'transparent',
                color:
                  activeSection === 'shopLook'
                    ? 'var(--color-accent-contrast)'
                    : 'var(--color-text-muted)',
              }}
            >
              Shop the Look Mosaic ({shopLookTiles.reduce((s, t) => s + t.hotspots.length, 0)} pins)
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection('collections')}
              className="px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              style={{
                backgroundColor:
                  activeSection === 'collections' ? 'var(--color-accent)' : 'transparent',
                color:
                  activeSection === 'collections'
                    ? 'var(--color-accent-contrast)'
                    : 'var(--color-text-muted)',
              }}
            >
              Room Collections ({collectionTiles.reduce((s, t) => s + t.hotspots.length, 0)} pins)
            </button>
          </div>

          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {totalPinsCount} interactive hotspots configured across {tiles.length}{' '}
            {activeSection === 'collections' ? 'collection' : 'mosaic'} frames
          </p>
        </div>

        {/* Tile Selector Cards */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${
            tiles.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-5'
          }`}
        >
          {tiles.map((tile, idx) => {
            const isSelected = activeTile?.id === tile.id;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleSelectTile(tile)}
                className={`group text-left rounded-lg border overflow-hidden transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-[var(--color-accent)]' : 'hover:opacity-90'
                }`}
                style={{
                  borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                }}
              >
                <div className="relative h-20 w-full overflow-hidden bg-black/5">
                  <img
                    src={resolveAssetUrl(tile.image)}
                    alt={tile.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[10px] font-semibold">
                    Frame {idx + 1}
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-white/95 text-[#1c1b19] text-[10px] font-semibold shadow-sm">
                    {tile.hotspots.length} {tile.hotspots.length === 1 ? 'pin' : 'pins'}
                  </span>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-xs font-medium truncate">{tile.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Split Editor: Visual Canvas (Left) + Pin & Details Inspector (Right) */}
      {activeTile && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Pin Placement Canvas */}
          <div
            className="xl:col-span-7 rounded-xl border p-4 sm:p-5 space-y-4"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-medium">{activeTile.label}</h2>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {canvasClickMode === 'add'
                    ? 'Click anywhere on the image below to drop a new pin point.'
                    : 'Click a dot to inspect it, or click anywhere on the photo to move the active pin.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCanvasClickMode((prev) => (prev === 'add' ? 'move' : 'add'))
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    canvasClickMode === 'add' ? 'vespera-btn-primary' : 'hover:bg-black/5'
                  }`}
                  style={{
                    borderColor: 'var(--color-border)',
                    color:
                      canvasClickMode === 'add'
                        ? 'var(--color-accent-contrast)'
                        : 'var(--color-text-primary)',
                  }}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>
                    {canvasClickMode === 'add' ? 'Click Image to Place Pin...' : 'Place New Pin on Image'}
                  </span>
                </button>

                <label
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-black/5 cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={handleTileImageUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowTileSettings((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                    showTileSettings ? 'vespera-btn-primary' : 'hover:bg-black/5'
                  }`}
                  style={{
                    borderColor: 'var(--color-border)',
                    color: showTileSettings
                      ? 'var(--color-accent-contrast)'
                      : 'var(--color-text-primary)',
                  }}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{showTileSettings ? 'Hide Change Image' : 'Change Image'}</span>
                </button>
              </div>
            </div>

            {/* Live Image Canvas with Real Hotspot Dots + Floating White Popover Preview */}
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`relative w-full aspect-[4/3] rounded-lg overflow-hidden border select-none ${
                canvasClickMode === 'add' ? 'cursor-crosshair' : 'cursor-pointer'
              }`}
              style={{ borderColor: 'var(--color-border)' }}
            >
              <img
                src={resolveAssetUrl(activeTile.image)}
                alt={activeTile.alt}
                className={`w-full h-full object-cover pointer-events-none ${
                  activeTile.objectPositionClass || 'object-center'
                }`}
              />

              {activeTile.hotspots.map((spot) => {
                const spotProduct = products.find((p) => p.id === spot.productId);
                if (!spotProduct) return null;
                const isSelected = activePin?.id === spot.id;
                const spotShowBadge =
                  spot.showBadge !== undefined ? spot.showBadge : spotProduct.newArrival;
                const spotBadgeLabel = spot.badgeText?.trim() || 'New';
                const spotTitle =
                  spot.customTitle?.trim() ||
                  spotProduct.name.split(' ').slice(0, 1).join('').toUpperCase();
                const spotSubtitle =
                  spot.customSubtitle?.trim() ||
                  spotProduct.name.split(' ').slice(1).join(' ') ||
                  spotProduct.category;
                const spotPrice =
                  spot.customPrice !== undefined && spot.customPrice > 0
                    ? spot.customPrice
                    : spotProduct.price;

                return (
                  <React.Fragment key={spot.id}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPinId(spot.id);
                        setCanvasClickMode('move');
                      }}
                      aria-label={`Select pin for ${spotTitle}`}
                      style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black/70 border-2 border-white scale-115 shadow-xl ring-4 ring-white/35'
                          : 'bg-black/40 border border-white/85 hover:scale-110 hover:bg-black/60'
                      }`}
                    >
                      <span
                        className={`rounded-full ${
                          isSelected ? 'w-3 h-3 bg-white' : 'w-2 h-2 bg-white'
                        }`}
                      />
                    </button>

                    {isSelected && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          top: `${Math.min(72, Math.max(24, spot.yPercent))}%`,
                          ...(spot.cardSide === 'left'
                            ? { right: `calc(${100 - spot.xPercent}% + 22px)` }
                            : { left: `calc(${spot.xPercent}% + 22px)` }),
                        }}
                        className="vespera-popover-preview absolute -translate-y-1/2 z-20 w-[195px] sm:w-[218px] bg-white text-[#1c1b19] shadow-[0_14px_34px_rgba(0,0,0,0.24)] border border-black/10 flex items-stretch text-left"
                      >
                        <div className="flex-1 min-w-0 p-3">
                          {spotShowBadge && (
                            <p className="text-[11px] font-bold text-[#d95d1e] leading-none mb-1">
                              {spotBadgeLabel}
                            </p>
                          )}
                          <p className="text-xs font-bold tracking-wide text-[#1c1b19] leading-tight truncate">
                            {spotTitle}
                          </p>
                          <p className="text-[11px] text-[#4b4741] leading-snug line-clamp-1 mt-0.5">
                            {spotSubtitle}
                          </p>
                          <p className="text-sm sm:text-base font-bold text-[#1c1b19] tabular-nums mt-1.5 leading-none">
                            {formatPrice(spotPrice)}
                          </p>
                        </div>
                        <span
                          className="w-8 shrink-0 border-l border-[#e6dfd5] flex items-center justify-center text-[#1c1b19] bg-white"
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

            {/* Frame Image Uploader, Studio Gallery & Metadata Editor */}
            {showTileSettings && (
              <div
                className="rounded-lg border p-4 sm:p-5 space-y-4"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">Change Frame Image</h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Upload a photo from your device, paste an image URL, or pick a curated studio room photo below.
                    </p>
                  </div>
                  <label className="vespera-btn-primary inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Photo File</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      onChange={handleTileImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Curated Studio & Showroom Gallery Quick Picker */}
                <div>
                  <label className="block text-xs font-medium mb-2">
                    Studio &amp; Showroom Photo Library
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {STUDIO_IMAGE_PRESETS.map((preset) => {
                      const active = activeTile.image === preset.src;
                      return (
                        <button
                          key={preset.src}
                          type="button"
                          onClick={() =>
                            updateActiveTile(
                              (t) => ({ ...t, image: preset.src }),
                              `Changed image to ${preset.label}`
                            )
                          }
                          className={`group rounded-lg border overflow-hidden text-left transition-all cursor-pointer ${
                            active ? 'ring-2 ring-[var(--color-accent)]' : 'hover:opacity-90'
                          }`}
                          style={{
                            borderColor: active
                              ? 'var(--color-accent)'
                              : 'var(--color-border)',
                            backgroundColor: 'var(--color-bg-surface)',
                          }}
                        >
                          <div className="relative h-14 w-full overflow-hidden">
                            <img
                              src={resolveAssetUrl(preset.src)}
                              alt={preset.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {active && (
                              <span
                                className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor: 'var(--color-accent)',
                                  color: 'var(--color-accent-contrast)',
                                }}
                              >
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <p className="px-1.5 py-1 text-[10px] font-medium truncate">
                            {preset.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium mb-1">Frame Label</label>
                    <input
                      type="text"
                      value={activeTile.label}
                      onChange={(e) =>
                        updateActiveTile((t) => ({ ...t, label: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-white"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Custom Image URL or Path</label>
                    <input
                      type="text"
                      value={activeTile.image}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const safe = sanitizeImageUrl(raw);
                        if (safe || raw === '') {
                          updateActiveTile((t) => ({ ...t, image: safe }));
                        } else {
                          notifyToast('Blocked unsafe image URL. Use HTTPS or /src/assets/ paths.');
                        }
                      }}
                      placeholder="https://... or /src/assets/images/..."
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-white"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Scene Description (Alt Text)</label>
                  <input
                    type="text"
                    value={activeTile.alt}
                    onChange={(e) =>
                      updateActiveTile((t) => ({ ...t, alt: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-white"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Pin Points List & Full Details Configurator */}
          <div className="xl:col-span-5 space-y-5">
            {/* Pins on Selected Frame */}
            <section
              className="rounded-xl border p-4 sm:p-5 space-y-3.5"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <h3 className="font-display text-base font-medium">
                    Pins on This Frame ({activeTile.hotspots.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddPinAt(50, 50)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg vespera-btn-primary text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pin</span>
                </button>
              </div>

              {activeTile.hotspots.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  No pins on this frame yet. Click &ldquo;Add Pin&rdquo; or click anywhere on the image.
                </p>
              ) : (
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {activeTile.hotspots.map((pin, index) => {
                    const p = products.find((item) => item.id === pin.productId);
                    const label =
                      pin.customTitle?.trim() ||
                      p?.name.split(' ').slice(0, 1).join('').toUpperCase() ||
                      'Pin';
                    const sub =
                      pin.customSubtitle?.trim() ||
                      p?.name.split(' ').slice(1).join(' ') ||
                      p?.category ||
                      '';
                    const active = activePin?.id === pin.id;
                    return (
                      <div
                        key={pin.id}
                        onClick={() => setSelectedPinId(pin.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedPinId(pin.id);
                          }
                        }}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                          active ? 'ring-1 ring-[var(--color-accent)]' : 'hover:bg-black/5'
                        }`}
                        style={{
                          borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                          backgroundColor: active
                            ? 'var(--color-bg-surface-alt)'
                            : 'transparent',
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-11 h-11 rounded-md border bg-white shrink-0 overflow-hidden"
                            style={{ borderColor: 'var(--color-border)' }}
                          >
                            {p?.images[0] && (
                              <SafeImage
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-contain p-0.5 mix-blend-multiply"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">
                              #{index + 1} · {label}{' '}
                              <span className="font-normal opacity-75 tabular-nums">
                                ({pin.xPercent}%, {pin.yPercent}%) · {pin.cardSide === 'left' ? 'Left' : 'Right'}
                              </span>
                            </p>
                            <p
                              className="text-[11px] truncate"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {sub}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePin(pin.id);
                          }}
                          aria-label={`Delete pin ${label}`}
                          className="w-8 h-8 rounded-md flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Selected Pin Point & Details Options */}
            {activePin && (
              <section
                className="rounded-xl border p-4 sm:p-5 space-y-4"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-medium">
                    Selected Pin Point &amp; Details
                  </h3>
                  <button
                    type="button"
                    onClick={handleResetOverrides}
                    className="text-[11px] font-medium underline underline-offset-4 hover:opacity-75 cursor-pointer"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Sync with Product
                  </button>
                </div>

                {/* Linked Product (Searchable Visual Product List Picker) */}
                <div ref={productPickerRef} className="relative">
                  <label className="block text-xs font-medium mb-1.5">
                    Linked Catalog Product (Click Destination)
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setProductPickerOpen((prev) => !prev);
                      setProductQuery('');
                    }}
                    aria-expanded={productPickerOpen}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors hover:bg-black/[0.02] cursor-pointer"
                    style={{
                      borderColor: productPickerOpen
                        ? 'var(--color-accent)'
                        : 'var(--color-border)',
                      backgroundColor: 'var(--color-bg-surface)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-md border bg-white shrink-0 overflow-hidden"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        {activeProduct?.images[0] && (
                          <SafeImage
                            src={activeProduct.images[0]}
                            alt={activeProduct.name}
                            className="w-full h-full object-contain p-0.5 mix-blend-multiply"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">
                          {activeProduct ? activeProduct.name : 'Select a catalog piece'}
                        </p>
                        {activeProduct && (
                          <p
                            className="text-[11px] truncate"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {activeProduct.category} · {activeProduct.material} ·{' '}
                            <span className="font-mono-tabular font-semibold">
                              {formatPrice(activeProduct.price)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                        productPickerOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {productPickerOpen && (
                    <div
                      className="absolute left-0 right-0 top-full mt-2 z-40 rounded-xl border shadow-2xl overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-bg-surface)',
                        borderColor: 'var(--color-border-strong)',
                      }}
                    >
                      {/* Sticky Search Input */}
                      <div
                        className="p-2.5 border-b flex items-center gap-2"
                        style={{
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-bg-surface-alt)',
                        }}
                      >
                        <Search className="w-4 h-4 opacity-60 shrink-0 ml-1" />
                        <input
                          type="search"
                          autoFocus
                          value={productQuery}
                          onChange={(e) => setProductQuery(e.target.value)}
                          placeholder="Search pieces by name, category, material, or SKU..."
                          className="flex-1 bg-transparent text-xs py-1 focus:outline-none"
                        />
                      </div>

                      {/* Upgraded Visual Product List */}
                      <div className="max-h-[340px] overflow-y-auto divide-y" style={{ borderColor: 'var(--color-border)' }}>
                        {(() => {
                          const q = productQuery.trim().toLowerCase();
                          const filteredProducts = products.filter(
                            (p) =>
                              !q ||
                              p.name.toLowerCase().includes(q) ||
                              p.category.toLowerCase().includes(q) ||
                              p.material.toLowerCase().includes(q) ||
                              p.sku.toLowerCase().includes(q)
                          );

                          if (filteredProducts.length === 0) {
                            return (
                              <p
                                className="text-xs text-center py-8 px-4"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                No catalog products match &ldquo;{productQuery}&rdquo;.
                              </p>
                            );
                          }

                          return filteredProducts.map((prod) => {
                            const selected = prod.id === activePin.productId;
                            return (
                              <button
                                key={prod.id}
                                type="button"
                                onClick={() => {
                                  updateActivePin({ productId: prod.id });
                                  setProductPickerOpen(false);
                                  setProductQuery('');
                                }}
                                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-black/[0.04] cursor-pointer"
                                style={{
                                  backgroundColor: selected
                                    ? 'var(--color-bg-surface-alt)'
                                    : 'transparent',
                                }}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className="w-12 h-12 rounded-md border bg-white shrink-0 overflow-hidden"
                                    style={{ borderColor: 'var(--color-border)' }}
                                  >
                                    <SafeImage
                                      src={prod.images[0]}
                                      alt={prod.name}
                                      className="w-full h-full object-contain p-1 mix-blend-multiply"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold truncate">
                                      {prod.name}
                                    </p>
                                    <p
                                      className="text-[11px] truncate"
                                      style={{ color: 'var(--color-text-muted)' }}
                                    >
                                      {prod.category} · {prod.material} · {prod.sku}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  <span className="text-xs font-mono-tabular font-semibold">
                                    {formatPrice(prod.price)}
                                  </span>
                                  <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                      selected ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    style={{
                                      backgroundColor: 'var(--color-accent)',
                                      color: 'var(--color-accent-contrast)',
                                    }}
                                  >
                                    <Check className="w-3 h-3" />
                                  </span>
                                </div>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* X & Y Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">Horizontal X (%)</span>
                      <span className="tabular-nums font-semibold">{activePin.xPercent}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={4}
                        max={96}
                        value={activePin.xPercent}
                        onChange={(e) =>
                          updateActivePin({ xPercent: Number(e.target.value) })
                        }
                        className="flex-1 accent-[var(--color-accent)] cursor-pointer"
                      />
                      <input
                        type="number"
                        min={4}
                        max={96}
                        value={activePin.xPercent}
                        onChange={(e) =>
                          updateActivePin({
                            xPercent: Math.min(96, Math.max(4, Number(e.target.value) || 50)),
                          })
                        }
                        className="w-14 px-2 py-1 text-xs rounded border bg-transparent tabular-nums"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">Vertical Y (%)</span>
                      <span className="tabular-nums font-semibold">{activePin.yPercent}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={4}
                        max={96}
                        value={activePin.yPercent}
                        onChange={(e) =>
                          updateActivePin({ yPercent: Number(e.target.value) })
                        }
                        className="flex-1 accent-[var(--color-accent)] cursor-pointer"
                      />
                      <input
                        type="number"
                        min={4}
                        max={96}
                        value={activePin.yPercent}
                        onChange={(e) =>
                          updateActivePin({
                            yPercent: Math.min(96, Math.max(4, Number(e.target.value) || 50)),
                          })
                        }
                        className="w-14 px-2 py-1 text-xs rounded border bg-transparent tabular-nums"
                        style={{ borderColor: 'var(--color-border)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Details Card Placement Side */}
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Details Card Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['left', 'right'] as const).map((side) => {
                      const active = activePin.cardSide === side;
                      return (
                        <button
                          key={side}
                          type="button"
                          onClick={() => updateActivePin({ cardSide: side })}
                          className="px-3 py-2 rounded-lg border text-xs font-semibold capitalize transition-colors cursor-pointer"
                          style={{
                            backgroundColor: active
                              ? 'var(--color-accent)'
                              : 'transparent',
                            color: active
                              ? 'var(--color-accent-contrast)'
                              : 'var(--color-text-primary)',
                            borderColor: active
                              ? 'var(--color-accent)'
                              : 'var(--color-border)',
                          }}
                        >
                          Open {side} of pin
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Details Popover Customization */}
                <div
                  className="pt-3 border-t space-y-3"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={resolvedShowBadge}
                        onChange={(e) => updateActivePin({ showBadge: e.target.checked })}
                        className="accent-[var(--color-accent)]"
                      />
                      <span>Show Highlight Tag</span>
                    </label>

                    <input
                      type="text"
                      disabled={!resolvedShowBadge}
                      value={activePin.badgeText ?? ''}
                      placeholder="New"
                      onChange={(e) => updateActivePin({ badgeText: e.target.value })}
                      className="w-32 px-2.5 py-1 text-xs rounded-md border bg-transparent disabled:opacity-45"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Details Card Title
                    </label>
                    <input
                      type="text"
                      value={activePin.customTitle ?? ''}
                      placeholder={autoHeadline}
                      onChange={(e) => updateActivePin({ customTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Details Card Subtitle / Description
                    </label>
                    <input
                      type="text"
                      value={activePin.customSubtitle ?? ''}
                      placeholder={autoSubtitle}
                      onChange={(e) => updateActivePin({ customSubtitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-transparent"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <label className="font-medium">
                        Custom Price Override (USD base)
                      </label>
                      {activeProduct && (
                        <span className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                          Displays:{' '}
                          {formatPrice(
                            activePin.customPrice !== undefined && activePin.customPrice > 0
                              ? activePin.customPrice
                              : activeProduct.price
                          )}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={activePin.customPrice ?? ''}
                      placeholder={activeProduct ? String(activeProduct.price) : '0'}
                      onChange={(e) => {
                        const raw = e.target.value;
                        updateActivePin({
                          customPrice: raw === '' ? undefined : Math.max(0, Number(raw) || 0),
                        });
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border bg-transparent tabular-nums"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
