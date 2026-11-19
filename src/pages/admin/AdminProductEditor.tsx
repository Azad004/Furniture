import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Eye,
  Image as ImageIcon,
  Layers,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ALL_CATEGORIES, FurnitureCategory, MaterialType } from '../../types/store';
import { SafeImage } from '../../components/common/SafeImage';
import { sanitizeImageUrl, validateAndReadImageFile } from '../../utils/security';

interface AdminProductEditorProps {
  mode: 'new' | 'edit';
  productId?: string;
}

const CATEGORIES: FurnitureCategory[] = ALL_CATEGORIES;

const MATERIALS: MaterialType[] = [
  'Solid White Oak',
  'American Walnut',
  'Belgian Linen',
  'Ivory Bouclé',
  'Honed Travertine',
  'Brushed Brass',
];

const STUDIO_GALLERY_PRESETS = [
  { label: 'Bouclé Lounge Cutout', src: '/src/assets/images/whitebg_boucle_chair_iso_1794928869933.jpg' },
  { label: 'Travertine Table Cutout', src: '/src/assets/images/whitebg_travertine_table_iso_1794928870908.jpg' },
  { label: 'Walnut Credenza Cutout', src: '/src/assets/images/whitebg_walnut_credenza_iso_1794928872442.jpg' },
  { label: 'Belgian Linen Sofa Cutout', src: '/src/assets/images/whitebg_linen_sofa_iso_1794928871087.jpg' },
  { label: 'Oak Platform Bed', src: '/src/assets/images/hero_lookcreative_bedroom_1794926094097.jpg' },
  { label: 'Living Sanctuary Scene', src: '/src/assets/images/hero_lookcreative_living_1794926095098.jpg' },
  { label: 'Dining Atelier Scene', src: '/src/assets/images/hero_lookcreative_dining_1794926095951.jpg' },
  { label: 'Oak Dining Chair', src: '/src/assets/images/product_oak_dining_chair_1794926097049.jpg' },
];

export const AdminProductEditor: React.FC<AdminProductEditorProps> = ({ mode, productId }) => {
  const {
    products,
    orders,
    productViewCounts,
    addProduct,
    updateProduct,
    deleteProduct,
    navigate,
    formatPrice,
    currencySettings,
  } = useStore();

  const editingProduct = useMemo(
    () => (mode === 'edit' && productId ? products.find((p) => p.id === productId) || null : null),
    [mode, productId, products]
  );

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<FurnitureCategory>('Sofas');
  const [material, setMaterial] = useState<MaterialType>('Solid White Oak');
  const [price, setPrice] = useState<number>(1450);
  const [stock, setStock] = useState<number>(10);
  const [dimensions, setDimensions] = useState('90 cm W × 85 cm D × 76 cm H');
  const [leadTime, setLeadTime] = useState('Ships in 5–7 business days');
  const [description, setDescription] = useState('');
  const [craftsmanshipNote, setCraftsmanshipNote] = useState(
    'Kiln-dried solid hardwood frame finished in zero-VOC plant oil.'
  );
  const [productImages, setProductImages] = useState<string[]>([
    '/src/assets/images/whitebg_boucle_chair_iso_1794928869933.jpg',
    '/src/assets/images/product_boucle_lounge_1794926095999.jpg',
  ]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [finishesInput, setFinishesInput] = useState('Natural Matte Oak, Smoked Walnut');
  const [bestSeller, setBestSeller] = useState(false);
  const [newArrival, setNewArrival] = useState(true);
  const [showPresetGallery, setShowPresetGallery] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && editingProduct) {
      setName(editingProduct.name);
      setSku(editingProduct.sku);
      setCategory(editingProduct.category);
      setMaterial(editingProduct.material);
      setPrice(editingProduct.price);
      setStock(editingProduct.stock);
      setDimensions(editingProduct.dimensions);
      setLeadTime(editingProduct.leadTime);
      setDescription(editingProduct.description);
      setCraftsmanshipNote(editingProduct.craftsmanshipNote);
      setProductImages(editingProduct.images.length > 0 ? editingProduct.images : ['']);
      setNewImageUrlInput('');
      setFinishesInput(editingProduct.finishes.join(', '));
      setBestSeller(editingProduct.bestSeller);
      setNewArrival(editingProduct.newArrival);
    } else if (mode === 'new') {
      setName('');
      setSku(`VSP-NEW-${Math.floor(100 + Math.random() * 899)}`);
      setCategory('Sofas');
      setMaterial('Solid White Oak');
      setPrice(1450);
      setStock(10);
      setDimensions('90 cm W × 85 cm D × 76 cm H');
      setLeadTime('Ships in 5–7 business days');
      setDescription('');
      setCraftsmanshipNote('Kiln-dried solid hardwood frame finished in zero-VOC plant oil.');
      setProductImages([
        '/src/assets/images/whitebg_boucle_chair_iso_1794928869933.jpg',
        '/src/assets/images/product_boucle_lounge_1794926095999.jpg',
      ]);
      setNewImageUrlInput('');
      setFinishesInput('Natural Matte Oak, Smoked Oak');
      setBestSeller(false);
      setNewArrival(true);
    }
  }, [mode, editingProduct]);

  const parsedFinishes = finishesInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const editAnalytics = useMemo(() => {
    if (!editingProduct) return { views: 0, orderCount: 0, unitsSold: 0 };
    const views = productViewCounts[editingProduct.id] || 0;
    let orderCount = 0;
    let unitsSold = 0;
    orders.forEach((order) => {
      if (order.status === 'Cancelled' || order.status === 'Refunded') return;
      const matchedItems = order.items.filter((i) => i.productId === editingProduct.id);
      if (matchedItems.length > 0) {
        orderCount += 1;
        unitsSold += matchedItems.reduce((s, it) => s + it.quantity, 0);
      }
    });
    return { views, orderCount, unitsSold };
  }, [editingProduct, orders, productViewCounts]);

  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 6);
    e.target.value = '';
    if (files.length === 0) return;
    setMediaError(null);

    const accepted: string[] = [];
    const errors: string[] = [];
    for (const file of files) {
      const result = await validateAndReadImageFile(file);
      if (result.ok) {
        accepted.push(result.dataUrl);
      } else {
        errors.push(result.error);
      }
    }

    if (accepted.length > 0) {
      setProductImages((prev) => [...prev.filter(Boolean), ...accepted].slice(0, 10));
    }
    if (errors.length > 0) {
      setMediaError(errors[0]);
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = newImageUrlInput.trim();
    if (!trimmed) return;
    const safe = sanitizeImageUrl(trimmed);
    if (!safe) {
      setMediaError(
        'Invalid or unsafe image URL. Use an HTTPS image URL or a local /src/assets/ path (SVG/JS links are blocked).'
      );
      return;
    }
    setMediaError(null);
    setProductImages((prev) => [...prev.filter(Boolean), safe].slice(0, 10));
    setNewImageUrlInput('');
  };

  const handleSetPrimaryImage = (index: number) => {
    setProductImages((prev) => {
      const target = prev[index];
      if (!target) return prev;
      return [target, ...prev.filter((_, i) => i !== index)];
    });
  };

  const handleRemoveImage = (index: number) => {
    setProductImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const cleanImages = productImages.filter(Boolean);
    const finishes = parsedFinishes.length ? parsedFinishes : ['Standard Finish'];

    if (mode === 'edit' && editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        sku: sku.trim(),
        category,
        material,
        price: Number(price),
        stock: Number(stock),
        dimensions: dimensions.trim(),
        leadTime: leadTime.trim(),
        description: description.trim(),
        craftsmanshipNote: craftsmanshipNote.trim(),
        images: cleanImages,
        finishes,
        bestSeller,
        newArrival,
      });
    } else {
      addProduct({
        name: name.trim(),
        sku: sku.trim(),
        category,
        material,
        price: Number(price),
        stock: Number(stock),
        dimensions: dimensions.trim(),
        leadTime: leadTime.trim(),
        description:
          description.trim() ||
          'Handcrafted architectural furniture piece tailored for timeless residential interiors.',
        craftsmanshipNote: craftsmanshipNote.trim(),
        images: cleanImages,
        finishes,
        bestSeller,
        newArrival,
      });
    }
    navigate({ page: 'admin', module: 'products' });
  };

  if (mode === 'edit' && !editingProduct) {
    return (
      <div
        className="rounded-xl border p-10 text-center space-y-4"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Package className="w-10 h-10 mx-auto opacity-35" />
        <h1 className="font-display text-2xl font-medium">Product Not Found</h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
          The requested product record may have been removed from the catalog.
        </p>
        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'products' })}
          className="vespera-btn-primary px-5 py-2.5 text-sm font-semibold cursor-pointer"
        >
          Back to Product Management
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Page Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => navigate({ page: 'admin', module: 'products' })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline cursor-pointer"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product Listing</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">
            {mode === 'edit' ? `Edit Piece: ${editingProduct?.name}` : 'Create New Furniture Piece'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {mode === 'edit' && editingProduct && (
            <button
              type="button"
              onClick={() => navigate({ page: 'product', slug: editingProduct.slug })}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-medium hover:bg-black/5 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View on Storefront</span>
            </button>
          )}

          {mode === 'edit' && editingProduct && (
            <button
              type="button"
              onClick={() => {
                deleteProduct(editingProduct.id);
                navigate({ page: 'admin', module: 'products' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-medium text-rose-700 hover:bg-rose-50 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate({ page: 'admin', module: 'products' })}
            className="px-4 py-2.5 rounded-lg border text-sm font-medium hover:bg-black/5 cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="vespera-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{mode === 'edit' ? 'Save Changes' : 'Publish Piece'}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Editor Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Core Details, Specifications, Gallery */}
        <div className="xl:col-span-8 space-y-6">
          {/* Card 1: Basic Identity & Story */}
          <section
            className="rounded-xl border p-5 sm:p-6 space-y-5"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <Package className="w-4 h-4 opacity-70" />
              <h2 className="font-display text-lg font-medium">Piece Identity &amp; Story</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Piece Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Atelier Sculpted Oak Bench"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">SKU Reference</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent font-mono-tabular"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FurnitureCategory)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-surface)] cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Primary Material</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as MaterialType)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-surface)] cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Editorial Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the silhouette, proportions, comfort profile, and architectural intent..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent leading-relaxed"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5">Craftsmanship &amp; Joinery Note</label>
                <textarea
                  rows={2}
                  value={craftsmanshipNote}
                  onChange={(e) => setCraftsmanshipNote(e.target.value)}
                  placeholder="Detail timber origin, joinery technique, upholstery grade, or surface treatment..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent leading-relaxed"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
            </div>
          </section>

          {/* Card 2: Specifications & Finishes */}
          <section
            className="rounded-xl border p-5 sm:p-6 space-y-5"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <Layers className="w-4 h-4 opacity-70" />
              <h2 className="font-display text-lg font-medium">Dimensions, Delivery &amp; Finishes</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Dimensions</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 90 cm W × 85 cm D × 76 cm H"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">Dispatch Lead Time</label>
                <input
                  type="text"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  placeholder="e.g. Ships in 5–7 business days"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-medium">Available Finishes (comma separated)</label>
                <input
                  type="text"
                  value={finishesInput}
                  onChange={(e) => setFinishesInput(e.target.value)}
                  placeholder="e.g. Natural Matte Oak, Smoked Walnut, Chalk Ivory"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
                {parsedFinishes.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {parsedFinishes.map((finish, idx) => (
                      <span
                        key={`${finish}-${idx}`}
                        className="px-2.5 py-1 rounded-md border text-xs"
                        style={{
                          borderColor: 'var(--color-border)',
                          backgroundColor: 'var(--color-bg-surface-alt)',
                        }}
                      >
                        {finish}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Card 3: Multi-Image Gallery */}
          <section
            className="rounded-xl border p-5 sm:p-6 space-y-5"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 opacity-70" />
                <h2 className="font-display text-lg font-medium">Product Media Gallery</h2>
              </div>
              <span className="text-xs font-mono-tabular" style={{ color: 'var(--color-text-muted)' }}>
                {productImages.filter(Boolean).length} image(s)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {productImages.filter(Boolean).map((img, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border overflow-hidden bg-white flex flex-col"
                  style={{
                    borderColor: idx === 0 ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-white">
                    <SafeImage
                      src={img}
                      alt={`Product gallery image ${idx + 1}`}
                      className="w-full h-full object-contain p-2 mix-blend-multiply"
                    />
                  </div>
                  <div
                    className="px-2.5 py-2 border-t flex items-center justify-between gap-1 text-xs"
                    style={{
                      backgroundColor: 'var(--color-bg-surface-alt)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {idx === 0 ? (
                      <span className="font-semibold">Primary</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="underline cursor-pointer"
                      >
                        Set Primary
                      </button>
                    )}
                    {productImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-rose-700 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <label
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold hover:bg-black/5 cursor-pointer shrink-0"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Upload className="w-4 h-4" />
                <span>Upload PNG / JPG Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={handleMultiImageUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newImageUrlInput}
                  onChange={(e) => setNewImageUrlInput(e.target.value)}
                  placeholder="Paste HTTPS image URL or /src/assets/... path"
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg border bg-transparent font-mono-tabular"
                  style={{ borderColor: 'var(--color-border)' }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border text-xs font-semibold hover:bg-black/5 cursor-pointer shrink-0"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowPresetGallery((v) => !v)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 cursor-pointer shrink-0"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{showPresetGallery ? 'Hide Library' : 'Studio Library'}</span>
              </button>
            </div>

            {mediaError && (
              <p
                role="alert"
                className="rounded-lg border px-3.5 py-2 text-xs font-medium text-rose-800 bg-rose-50 border-rose-200"
              >
                {mediaError}
              </p>
            )}

            {showPresetGallery && (
              <div
                className="rounded-lg border p-3.5 space-y-2.5"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-bg-surface-alt)',
                }}
              >
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  Quick Add from Studio Asset Library
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {STUDIO_GALLERY_PRESETS.map((preset) => (
                    <button
                      key={preset.src}
                      type="button"
                      onClick={() =>
                        setProductImages((prev) =>
                          prev.includes(preset.src) ? prev : [...prev.filter(Boolean), preset.src]
                        )
                      }
                      className="rounded-lg border overflow-hidden bg-white text-left hover:ring-2 hover:ring-[var(--color-accent)] transition-all cursor-pointer"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div className="h-20 w-full overflow-hidden bg-white">
                        <SafeImage
                          src={preset.src}
                          alt={preset.label}
                          className="w-full h-full object-contain p-1 mix-blend-multiply"
                        />
                      </div>
                      <p className="px-2 py-1 text-[11px] font-medium truncate border-t" style={{ borderColor: 'var(--color-border)' }}>
                        {preset.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right 4 Columns: Pricing, Stock, Merchandising, Preview */}
        <div className="xl:col-span-4 space-y-6">
          {/* Card 4: Pricing & Inventory */}
          <section
            className="rounded-xl border p-5 sm:p-6 space-y-4"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h2 className="font-display text-lg font-medium pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              Pricing &amp; Inventory
            </h2>

            <div>
              <label className="block text-xs font-medium mb-1.5">Base Price (USD)</label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent font-mono-tabular"
                style={{ borderColor: 'var(--color-border)' }}
              />
              {currencySettings.currency === 'BDT' && (
                <p className="text-xs mt-1.5 font-mono-tabular" style={{ color: 'var(--color-text-muted)' }}>
                  Storefront Display: {formatPrice(Number(price) || 0)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">Inventory Stock (Units)</label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent font-mono-tabular"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>

            {mode === 'edit' && editingProduct && (
              <div
                className="pt-3 border-t grid grid-cols-2 gap-3"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div
                  className="rounded-lg border p-3 space-y-1"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                  }}
                >
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <Eye className="w-3.5 h-3.5" />
                    <span>User Views</span>
                  </span>
                  <p className="text-lg font-semibold font-mono-tabular">
                    {editAnalytics.views.toLocaleString('en-US')}
                  </p>
                </div>

                <div
                  className="rounded-lg border p-3 space-y-1"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface-alt)',
                  }}
                >
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>User Orders</span>
                  </span>
                  <p className="text-lg font-semibold font-mono-tabular">
                    {editAnalytics.orderCount}{' '}
                    <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>
                      ({editAnalytics.unitsSold}u)
                    </span>
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Card 5: Merchandising Flags */}
          <section
            className="rounded-xl border p-5 sm:p-6 space-y-4"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <Sparkles className="w-4 h-4 opacity-70" />
              <h2 className="font-display text-lg font-medium">Catalog Visibility</h2>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-black/[0.02]" style={{ borderColor: 'var(--color-border)' }}>
              <input
                type="checkbox"
                checked={bestSeller}
                onChange={(e) => setBestSeller(e.target.checked)}
                className="accent-[var(--color-accent)] mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">Feature in Best Sellers</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Display inside homepage Best Sellers slider &amp; default sort priority.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-black/[0.02]" style={{ borderColor: 'var(--color-border)' }}>
              <input
                type="checkbox"
                checked={newArrival}
                onChange={(e) => setNewArrival(e.target.checked)}
                className="accent-[var(--color-accent)] mt-0.5"
              />
              <div>
                <p className="text-sm font-medium">Tag as New Arrival</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Highlights the piece in the New Arrivals carousel &amp; hotspot badge defaults.
                </p>
              </div>
            </label>
          </section>

          {/* Card 6: Live Storefront Card Preview */}
          <section
            className="rounded-xl border p-5 sm:p-6 space-y-4"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <h2 className="font-display text-lg font-medium pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              Live Card Preview
            </h2>

            <div
              className="rounded-xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="aspect-[4/3] w-full bg-white overflow-hidden">
                <SafeImage
                  src={productImages.filter(Boolean)[0] || ''}
                  alt={name || 'Product preview'}
                  className="w-full h-full object-contain p-3 mix-blend-multiply"
                />
              </div>
              <div className="p-4 border-t space-y-1.5" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {category} · {material}
                </p>
                <p className="font-display text-base font-medium leading-snug">
                  {name.trim() || 'Untitled Furniture Piece'}
                </p>
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="font-mono-tabular text-base font-semibold">
                    {formatPrice(Number(price) || 0)}
                  </span>
                  <span className="text-xs" style={{ color: stock > 0 ? 'var(--color-text-muted)' : '#b91c1c' }}>
                    {stock > 0 ? `${stock} In Stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
};
