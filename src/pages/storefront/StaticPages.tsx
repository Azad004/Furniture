import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  Layers,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FurnitureCategory } from '../../types/store';
import { SafeImage } from '../../components/common/SafeImage';

const MATERIAL_ARCHIVE: Array<{
  id: string;
  title: string;
  origin: string;
  finish: string;
  description: string;
  image: string;
  category: FurnitureCategory;
}> = [
  {
    id: 'timber',
    title: 'Kiln-Dried Walnut & White Oak',
    origin: 'Pennsylvania & Bavarian Sustainable Forests',
    finish: 'Zero-VOC cold-pressed linseed & plant wax',
    description:
      'Selected for straight architectural cathedral grain and slow air-seasoning prior to kiln stabilization. Our timber settles naturally across seasons and develops deeper honey and amber patina with decades of daylight.',
    image: '/src/assets/images/product_walnut_credenza_1794926094553.jpg',
    category: 'Storage',
  },
  {
    id: 'stone',
    title: 'Open-Pored Roman Travertine',
    origin: 'Tivoli Quarries, Lazio, Italy',
    finish: 'Honed matte open pore sealed with breathable stone wax',
    description:
      'Cut parallel to the sedimentary bedding plane to expose delicate mineral bands without synthetic epoxy fillers. Every slab is structurally braced and hand-bevelled to carry sculptural calm in dining and living spaces.',
    image: '/src/assets/images/product_travertine_table_1794926096128.jpg',
    category: 'Tables',
  },
  {
    id: 'textiles',
    title: 'Belgian Flax & French Wool Bouclé',
    origin: 'Flanders Looms & Lyon Weaving Houses',
    finish: 'Oeko-Tex certified unbleached natural fibers',
    description:
      'Long-staple heavy-weight Belgian linen and crisp curly wool bouclé spun without optical brighteners. Tailored over natural latex and feather-wrapped cushions for restorative comfort that softens gracefully.',
    image: '/src/assets/images/product_linen_sofa_1794926095674.jpg',
    category: 'Sofas',
  },
  {
    id: 'brass',
    title: 'Patinated Brass & Spanish Alabaster',
    origin: 'Barcelona Stone Carvers & Milanese Foundries',
    finish: 'Unlacquered brushed satin brass',
    description:
      'Solid turned brass stems paired with translucent veined Aragon alabaster domes. Designed to warm rooms with diffused 2700K architectural glow while oxidizing subtly at the touch of your hand.',
    image: '/src/assets/images/product_brass_floor_lamp_1794926095796.jpg',
    category: 'Lighting',
  },
];

const SHOWROOMS = [
  {
    city: 'San Francisco',
    district: 'Jackson Square Flagship & Material Archive',
    address: '480 Jackson Street, San Francisco, CA 94111',
    hours: 'Tue – Sat, 10:00 AM – 6:00 PM',
    focus: 'Full architectural furniture floor & bespoke timber library',
  },
  {
    city: 'New York',
    district: 'SoHo Cast-Iron Viewing Loft',
    address: '92 Mercer Street, Suite 4B, New York, NY 10012',
    hours: 'Tue – Sat, 11:00 AM – 7:00 PM',
    focus: 'Residential trade consultations & lighting installations',
  },
  {
    city: 'Copenhagen',
    district: 'Nordic Joinery & Prototype Studio',
    address: 'Bredgade 45, 1260 København K, Denmark',
    hours: 'By Private Trade Appointment',
    focus: 'Custom millwork prototyping & steam-bent seating R&D',
  },
];

export const AboutPage: React.FC = () => {
  const { navigate } = useStore();
  const [selectedMaterialId, setSelectedMaterialId] = useState(MATERIAL_ARCHIVE[0].id);

  const activeMaterial =
    MATERIAL_ARCHIVE.find((m) => m.id === selectedMaterialId) || MATERIAL_ARCHIVE[0];

  return (
    <main>
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
                The Atelier Philosophy · San Francisco &amp; Copenhagen
              </p>
              <h1 className="font-display headline-balance text-3xl sm:text-5xl lg:text-[3.4rem] font-medium leading-[1.12]">
                Furniture built to gather patina, never obsolescence.
              </h1>
            </div>

            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Founded in 2016 between San Francisco and Copenhagen, Vespera Atelier partners directly with family-owned timber mills, Belgian flax weavers, and Roman travertine quarries to produce quiet, enduring furniture in small numbered runs.
            </p>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Every silhouette rejects synthetic veneers and concealed staples in favor of exposed wedged joinery, breathable oil finishes, and replaceable upholstery built for generations of daily living.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate({ page: 'collections' })}
                className="vespera-btn-primary px-6 py-3 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Room Collections</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate({ page: 'contact' })}
                className="px-6 py-3 rounded-lg border text-sm font-medium hover:bg-black/5 transition-colors cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Book Showroom Visit
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div
              className="aspect-[4/3] rounded-xl overflow-hidden border"
              style={{
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <SafeImage
                src="/src/assets/images/hero_lookcreative_dining_1794926095951.jpg"
                alt="Vespera Atelier architectural dining showcase crafted in American walnut"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--color-text-muted)' }}>
              <span>Verona Walnut Dining Table &amp; Sora Oak Seating</span>
              <span>Archive Study · San Francisco</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROVENANCE METRICS STRIP */}
      <section
        className="border-y"
        style={{
          backgroundColor: 'var(--color-bg-surface-alt)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-medium" style={{ color: 'var(--color-brass)' }}>
              100% FSC
            </p>
            <p className="text-sm font-semibold">Certified Hardwoods</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Kiln-dried solid European oak &amp; American walnut
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-medium" style={{ color: 'var(--color-brass)' }}>
              10 Years
            </p>
            <p className="text-sm font-semibold">Structural Guarantee</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Backed by traditional mortise-and-tenon joinery
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-medium" style={{ color: 'var(--color-brass)' }}>
              Zero-VOC
            </p>
            <p className="text-sm font-semibold">Botanical Oil Finishes</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No synthetic polyurethane or toxic sealants
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-display text-3xl sm:text-4xl font-medium" style={{ color: 'var(--color-brass)' }}>
              3 Studios
            </p>
            <p className="text-sm font-semibold">Direct Consultation</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              San Francisco, New York &amp; Copenhagen
            </p>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE MATERIAL ARCHIVE */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-18 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
              Traceable Provenance
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-medium">
              The Material Library
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {MATERIAL_ARCHIVE.map((mat) => {
              const active = mat.id === activeMaterial.id;
              return (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => setSelectedMaterialId(mat.id)}
                  className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    active ? '' : 'hover:bg-black/5'
                  }`}
                  style={{
                    backgroundColor: active ? 'var(--color-accent)' : 'var(--color-bg-surface)',
                    color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-primary)',
                    borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                >
                  {mat.title.split('&')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="lg:col-span-6 min-h-[280px] sm:min-h-[380px]">
            <SafeImage
              src={activeMaterial.image}
              alt={activeMaterial.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
                  Origin · {activeMaterial.origin}
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-medium">
                  {activeMaterial.title}
                </h3>
              </div>

              <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {activeMaterial.description}
              </p>

              <div
                className="p-4 rounded-lg border text-xs space-y-1"
                style={{
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p className="font-semibold">Standard Studio Finish</p>
                <p style={{ color: 'var(--color-text-muted)' }}>{activeMaterial.finish}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate({ page: 'shop', category: activeMaterial.category })}
                className="vespera-btn-primary px-6 py-3 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Shop {activeMaterial.category}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate({ page: 'contact' })}
                className="px-5 py-3 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Request Swatch Sample
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE CRAFT PILLARS */}
      <section
        className="border-t py-14 sm:py-18"
        style={{
          backgroundColor: 'var(--color-bg-surface-alt)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
              Workshop Discipline
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-medium">
              How Every Piece Is Constructed
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div
              className="rounded-xl border p-6 sm:p-7 space-y-4"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-tabular text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
                  01 / JOINERY
                </span>
                <Layers className="w-5 h-5" style={{ color: 'var(--color-brass)' }} />
              </div>
              <h3 className="font-display text-xl font-medium">Honest Architectural Joinery</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                We replace disposable metal brackets with wedged mortise-and-tenon joinery, butterfly dovetail cleats, and solid hardwood plinths engineered to tighten naturally over decades.
              </p>
            </div>

            <div
              className="rounded-xl border p-6 sm:p-7 space-y-4"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-tabular text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
                  02 / SURFACES
                </span>
                <Compass className="w-5 h-5" style={{ color: 'var(--color-brass)' }} />
              </div>
              <h3 className="font-display text-xl font-medium">Tactile Living Surfaces</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Every board is sanded to 320 grit and hand-rubbed with plant oil and beeswax so the open timber pores remain warm to touch—never sealed beneath glossy plastic lacquer.
              </p>
            </div>

            <div
              className="rounded-xl border p-6 sm:p-7 space-y-4"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-tabular text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
                  03 / STEWARDSHIP
                </span>
                <ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-brass)' }} />
              </div>
              <h3 className="font-display text-xl font-medium">White-Glove Placement</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Each piece ships with mill provenance records, brass maintenance wax, and optional room-of-choice assembly and crating removal by our dedicated regional carriers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SHOWROOM FLAGSHIPS & CLOSING CTA */}
      <section className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-18 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
              Visit In Person
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-medium">
              Atelier Showrooms
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate({ page: 'contact' })}
            className="text-sm font-semibold underline underline-offset-4 cursor-pointer self-start sm:self-auto"
          >
            Schedule Private Walkthrough
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SHOWROOMS.map((room) => (
            <div
              key={room.city}
              className="rounded-xl border p-6 space-y-3 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-medium">{room.city}</h3>
                  <Award className="w-4 h-4" style={{ color: 'var(--color-brass)' }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
                  {room.district}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {room.address}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {room.hours}
                </p>
              </div>
              <p className="text-xs pt-3 border-t" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                {room.focus}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl border p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
          style={{
            backgroundColor: 'var(--color-bg-surface-alt)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="space-y-1">
            <h2 className="font-display text-2xl sm:text-3xl font-medium">
              Explore the Current Studio Collection
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              26 architectural pieces ready for white-glove dispatch across living, dining, and bedroom sanctuaries.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate({ page: 'shop', category: 'All' })}
              className="vespera-btn-primary px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer"
            >
              Browse Full Catalog
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'collections' })}
              className="px-5 py-3 rounded-lg border text-sm font-medium hover:bg-black/5 whitespace-nowrap cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Room Collections
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) return;
    setSent(true);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-14 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Client Concierge &amp; Trade Desk
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-medium">
              Contact the Atelier
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Arrange a material swatch consultation, schedule a private showroom walkthrough, or inquire about custom dimensions for residential architecture projects.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t text-sm" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-1 shrink-0" style={{ color: 'var(--color-brass)' }} />
              <div>
                <p className="font-medium">San Francisco Flagship</p>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  480 Jackson Street, San Francisco, CA 94111
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 mt-1 shrink-0" style={{ color: 'var(--color-brass)' }} />
              <div>
                <p className="font-medium">Studio Concierge</p>
                <p className="tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                  +1 (415) 799-4210
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 mt-1 shrink-0" style={{ color: 'var(--color-brass)' }} />
              <div>
                <p className="font-medium">Trade &amp; Client Inquiries</p>
                <p style={{ color: 'var(--color-text-muted)' }}>concierge@vespera-atelier.com</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="lg:col-span-7 rounded-xl border p-6 sm:p-8"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {sent ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <h2 className="font-display text-2xl font-medium">Inquiry Received</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                A senior furniture specialist from our Jackson Street studio will respond within one business day.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-sm font-medium underline underline-offset-4 cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-xl font-medium">Send a Studio Message</h2>

              <div>
                <label className="block text-xs font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Claire Beaumont"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="claire@studio.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Phone</label>
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
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your space, timeline, or pieces of interest..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <button
                type="submit"
                className="vespera-btn-primary px-6 py-3 text-sm font-semibold cursor-pointer"
              >
                Send Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  const { content, navigate } = useStore();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-8">
      <div className="space-y-2 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Legal &amp; Stewardship · Last updated {content.privacyPolicyUpdatedAt}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-medium">
          {content.privacyPolicyTitle}
        </h1>
      </div>

      <div
        className="space-y-5 text-sm sm:text-base leading-relaxed whitespace-pre-line"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {content.privacyPolicyBody}
      </div>

      <div
        className="pt-6 border-t flex items-center justify-between text-xs"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <span>Managed via Vespera Content Management</span>
        <button
          type="button"
          onClick={() => navigate({ page: 'admin', module: 'content' })}
          className="underline underline-offset-4 cursor-pointer"
        >
          Edit in Admin Panel
        </button>
      </div>
    </main>
  );
};
