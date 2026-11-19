import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  Clock,
  Layers,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from '../../components/common/SafeImage';
import { ProductCard } from '../../components/storefront/ProductCard';

interface AtelierEvent {
  id: string;
  title: string;
  city: 'San Francisco' | 'New York' | 'Copenhagen';
  venue: string;
  address: string;
  date: string;
  time: string;
  format: 'Material Salon' | 'Trade & Lighting Night' | 'Open Studio';
  host: string;
  seatsLeft: number;
  audience: string;
  description: string;
  agenda: Array<{ time: string; detail: string }>;
  image: string;
}

const ATELIER_EVENTS: AtelierEvent[] = [
  {
    id: 'evt-sf-archive',
    title: 'Roman Travertine & Timber Archive Evening',
    city: 'San Francisco',
    venue: 'Jackson Square Flagship',
    address: '480 Jackson Street, San Francisco, CA 94111',
    date: 'December 4, 2026',
    time: '5:30 PM – 8:00 PM PST',
    format: 'Material Salon',
    host: 'Henrik Lindahl, Head of Stone & Timber Curation',
    seatsLeft: 14,
    audience: 'Open to private collectors, residential clients, and AIA architectural partners',
    description:
      'Spend an unhurried evening in our Jackson Square gallery examining freshly quarried vein-cut Tivoli travertine slabs alongside quarter-sawn European white oak. Guests will compare raw oil, beeswax, and smoked timber treatments under directional evening light and leave with bespoke quarry-lot swatches.',
    agenda: [
      { time: '5:30 PM', detail: 'Aperitivo reception & open walkthrough of the 120-swatch material library' },
      { time: '6:15 PM', detail: 'Stone curator lecture: reading mineral vein direction & natural wax sealing' },
      { time: '7:10 PM', detail: 'One-on-one residential table sizing & finish consultations' },
    ],
    image: '/src/assets/images/showroom_sf_gallery_1794990927911.jpg',
  },
  {
    id: 'evt-ny-lighting',
    title: '2700K Alabaster & Unlacquered Brass Illumination Study',
    city: 'New York',
    venue: 'SoHo Cast-Iron Viewing Loft',
    address: '92 Mercer Street, Suite 4B, New York, NY 10012',
    date: 'December 12, 2026',
    time: '6:00 PM – 8:30 PM EST',
    format: 'Trade & Lighting Night',
    host: 'Claire Beaumont & Marcus Sterling, Architectural Lighting Advisors',
    seatsLeft: 9,
    audience: 'Interior designers, hospitality specifiers, and residential collectors',
    description:
      'Set inside our fourth-floor cast-iron loft on Mercer Street, this evening study explores warm low-glare illumination across wool bouclé, fluted walnut credenzas, and chalk plaster walls. Experience dim-to-warm Aragon alabaster sconces tested side by side at dusk.',
    agenda: [
      { time: '6:00 PM', detail: 'Twilight arrival inside the SoHo lighting & walnut gallery' },
      { time: '6:40 PM', detail: 'Live CRI 95+ dimming demonstration across dining and lounge vignettes' },
      { time: '7:30 PM', detail: 'Trade dossier distribution & complimentary courier sample kit booking' },
    ],
    image: '/src/assets/images/showroom_ny_loft_1794990929170.jpg',
  },
  {
    id: 'evt-cph-mill',
    title: 'Nordic Steam-Bending & Danish Paper-Cord Workshop',
    city: 'Copenhagen',
    venue: 'Bredgade Prototype Studio',
    address: 'Bredgade 45, 1260 København K, Denmark',
    date: 'January 16, 2027',
    time: '2:00 PM – 5:30 PM CET',
    format: 'Open Studio',
    host: 'Søren Møller, Master Chairmaker',
    seatsLeft: 11,
    audience: 'Design students, hospitality buyers, and craft enthusiasts',
    description:
      'Step behind our Copenhagen showroom into the working prototype mill. Watch master weavers tension 130 meters of unbleached three-ply Danish paper cord across a steam-bent white oak frame while inspecting full-scale 2027 dining chair prototypes.',
    agenda: [
      { time: '2:00 PM', detail: 'Espresso welcome & tour of kilned white oak timber racks' },
      { time: '2:45 PM', detail: 'Live steam-bending and wedged mortise-and-tenon joinery demonstration' },
      { time: '4:00 PM', detail: 'Hands-on paper-cord weaving trial & prototype critique' },
    ],
    image: '/src/assets/images/showroom_cph_studio_1794990929649.jpg',
  },
  {
    id: 'evt-sf-sanctuary',
    title: 'Quiet Sanctuary Bedrooms & Natural Sleep Ergonomics',
    city: 'San Francisco',
    venue: 'Jackson Square Flagship',
    address: '480 Jackson Street, San Francisco, CA 94111',
    date: 'January 28, 2027',
    time: '4:30 PM – 6:45 PM PST',
    format: 'Material Salon',
    host: 'Elena Rostova, Textile & Upholstery Lead',
    seatsLeft: 18,
    audience: 'Homeowners planning serene primary suites and boutique hospitality curators',
    description:
      'An intimate afternoon session exploring breathable bedroom architecture. Examine solid walnut platform joinery, unbleached Flemish flax headboards, and zero-VOC GOLS latex upholstery engineered for cooler indoor microclimates.',
    agenda: [
      { time: '4:30 PM', detail: 'Guided tactile comparison of raw linen vs. brushed cotton percale weaves' },
      { time: '5:15 PM', detail: 'Spatial proportion briefing: clearance geometry for low-slung beds & credenzas' },
      { time: '6:00 PM', detail: 'Open floor-plan Q&A with studio textile specialists' },
    ],
    image: '/src/assets/images/hero_lookcreative_bedroom_1794926094097.jpg',
  },
];

const PAST_SALONS = [
  {
    season: 'Autumn 2026',
    title: 'Flemish Flax & Undyed Wool Dialogue',
    location: 'SoHo Loft, New York',
    note: '42 residential architects reviewed our 100% unbleached Belgian linen upholstery line.',
  },
  {
    season: 'Summer 2026',
    title: 'End-Grain Joinery Retrospective',
    location: 'Bredgade Studio, Copenhagen',
    note: 'Exhibited 14 archival oak and walnut prototypes built without synthetic adhesives.',
  },
  {
    season: 'Spring 2026',
    title: 'Monolithic Dining Scale Exhibition',
    location: 'Jackson Square, San Francisco',
    note: 'Debuted our 10-seat honed travertine dining plinth paired with hand-turned brass lighting.',
  },
];

export const EventsPage: React.FC = () => {
  const { navigate } = useStore();
  const [cityFilter, setCityFilter] = useState<'All' | 'San Francisco' | 'New York' | 'Copenhagen'>('All');
  const [formatFilter, setFormatFilter] = useState<'All' | AtelierEvent['format']>('All');
  const [reservations, setReservations] = useState<Record<string, { code: string; guests: number }>>({});
  const [activeRsvpEvent, setActiveRsvpEvent] = useState<AtelierEvent | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestCount, setGuestCount] = useState(1);

  const filteredEvents = useMemo(
    () =>
      ATELIER_EVENTS.filter((evt) => {
        if (cityFilter !== 'All' && evt.city !== cityFilter) return false;
        if (formatFilter !== 'All' && evt.format !== formatFilter) return false;
        return true;
      }),
    [cityFilter, formatFilter]
  );

  const handleConfirmRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRsvpEvent || !guestName.trim() || !guestEmail.trim()) return;
    const passCode = `VSP-EVT-${Math.floor(1000 + Math.random() * 9000)}`;
    setReservations((prev) => ({
      ...prev,
      [activeRsvpEvent.id]: { code: passCode, guests: guestCount },
    }));
    setActiveRsvpEvent(null);
    setGuestName('');
    setGuestEmail('');
    setGuestCount(1);
  };

  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-14">
      <header
        className="pb-8 border-b space-y-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
              Showroom Calendar · Open Salons &amp; Trade Previews
            </p>
            <h1 className="font-display headline-balance text-3xl sm:text-5xl font-medium">
              Atelier Events &amp; Material Salons
            </h1>
            <p className="text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Gather inside our San Francisco, New York, and Copenhagen galleries for evening lighting studies, live Nordic joinery demonstrations, and curated material lectures led by our master craftspeople.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['All', 'San Francisco', 'New York', 'Copenhagen'] as const).map((city) => {
              const active = cityFilter === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setCityFilter(city)}
                  className="px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: active ? 'var(--color-accent)' : 'var(--color-bg-surface)',
                    color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-primary)',
                    borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Secondary Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium mr-1" style={{ color: 'var(--color-text-muted)' }}>
              Format:
            </span>
            {(['All', 'Material Salon', 'Trade & Lighting Night', 'Open Studio'] as const).map((fmt) => {
              const active = formatFilter === fmt;
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormatFilter(fmt)}
                  className="px-3 py-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: active ? 'var(--color-bg-surface-alt)' : 'transparent',
                    color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                  }}
                >
                  {fmt === 'All' ? 'All Formats' : fmt}
                </button>
              );
            })}
          </div>
          <span className="text-xs tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
            Showing {filteredEvents.length} upcoming {filteredEvents.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>
      </header>

      {/* Upcoming Event Dossiers */}
      {filteredEvents.length === 0 ? (
        <section
          className="rounded-xl border p-12 text-center space-y-4"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h2 className="font-display text-2xl font-medium">No scheduled events match this filter</h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Reset your city or format selection to browse all upcoming architectural salons across our three galleries.
          </p>
          <button
            type="button"
            onClick={() => {
              setCityFilter('All');
              setFormatFilter('All');
            }}
            className="vespera-btn-primary px-5 py-2.5 text-xs font-semibold cursor-pointer"
          >
            Show All Events
          </button>
        </section>
      ) : (
        <div className="space-y-10">
          {filteredEvents.map((evt) => {
            const reservation = reservations[evt.id];
            return (
              <section
                key={evt.id}
                className="rounded-xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="lg:col-span-5 min-h-[260px] sm:min-h-[360px]">
                  <SafeImage src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                </div>

                <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between gap-6">
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold" style={{ color: 'var(--color-brass)' }}>
                        {evt.city} · {evt.format}
                      </span>
                      <span className="font-medium tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                        {evt.date} · {evt.seatsLeft} seats remaining
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="font-display text-2xl sm:text-3xl font-medium leading-tight">
                        {evt.title}
                      </h2>
                      <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        Led by {evt.host}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                      {evt.description}
                    </p>

                    {/* Evening Programme Agenda */}
                    <div
                      className="pt-4 border-t space-y-2.5"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
                        Programme Schedule
                      </p>
                      <div className="space-y-2">
                        {evt.agenda.map((slot) => (
                          <div key={slot.time} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 text-xs sm:text-sm">
                            <span className="sm:col-span-3 font-mono-tabular font-semibold" style={{ color: 'var(--color-brass)' }}>
                              {slot.time}
                            </span>
                            <span className="sm:col-span-9" style={{ color: 'var(--color-text-muted)' }}>
                              {slot.detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Venue, Time & Audience */}
                    <div
                      className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                    >
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                        <span>{evt.venue} · {evt.address}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                        <span>{evt.time}</span>
                      </p>
                      <p className="sm:col-span-2 flex items-start gap-2">
                        <Users className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                        <span>Recommended for: {evt.audience}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex flex-wrap items-center gap-3">
                      {reservation ? (
                        <button
                          type="button"
                          onClick={() =>
                            setReservations((prev) => {
                              const next = { ...prev };
                              delete next[evt.id];
                              return next;
                            })
                          }
                          className="px-5 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                          style={{
                            borderColor: 'var(--color-accent)',
                            backgroundColor: 'var(--color-bg-surface-alt)',
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>
                            Reserved ({reservation.guests} {reservation.guests === 1 ? 'Seat' : 'Seats'} · {reservation.code})
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setGuestCount(1);
                            setActiveRsvpEvent(evt);
                          }}
                          className="vespera-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                        >
                          <span>Reserve Spot</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => navigate({ page: 'showrooms' })}
                        className="px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        Showroom Guide
                      </button>
                    </div>

                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Complimentary entry · RSVP required
                    </span>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Past Salon Archive & Private Group Hosting */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="lg:col-span-7 space-y-5">
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
              Exhibition Archive
            </p>
            <h2 className="font-display text-2xl font-medium mt-1">Recent Studio Salons</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PAST_SALONS.map((past) => (
              <article
                key={past.title}
                className="rounded-xl border p-5 space-y-2"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <p className="text-xs font-medium tabular-nums" style={{ color: 'var(--color-brass)' }}>
                  {past.season} · {past.location}
                </p>
                <h3 className="font-display text-lg font-medium leading-snug">{past.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {past.note}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside
          className="lg:col-span-5 rounded-xl border p-7 flex flex-col justify-between gap-5"
          style={{
            backgroundColor: 'var(--color-bg-surface-alt)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
              Architectural Trade Practices
            </p>
            <h2 className="font-display text-2xl font-medium">
              Host a Private Studio Material Briefing
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Design firms and hospitality teams (4–16 guests) may reserve our Jackson Square or SoHo swatch library after hours for guided stone, timber, and upholstery specification sessions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate({ page: 'contact' })}
              className="vespera-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Inquire for Private Hosting
            </button>
          </div>
        </aside>
      </section>

      {/* Interactive RSVP Modal */}
      {activeRsvpEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Reserve Salon Seat">
          <div className="fixed inset-0 bg-black/45" onClick={() => setActiveRsvpEvent(null)} />
          <div
            className="relative w-full max-w-md rounded-xl border p-6 space-y-5 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
                  {activeRsvpEvent.city} · {activeRsvpEvent.date}
                </p>
                <h3 className="font-display text-xl font-medium mt-0.5">{activeRsvpEvent.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveRsvpEvent(null)}
                aria-label="Close reservation dialog"
                className="p-1.5 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRsvp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Claire Beaumont"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="claire@studio.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Number of Seats</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-surface)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests (Trade Team)</option>
                </select>
              </div>
              <button
                type="submit"
                className="vespera-btn-primary w-full py-3 text-sm font-semibold cursor-pointer"
              >
                Confirm Salon Pass
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

interface SwatchStudy {
  name: string;
  hex: string;
  origin: string;
  finish: string;
}

interface StyleChapter {
  id: string;
  index: string;
  label: string;
  title: string;
  subtitle: string;
  readTime: string;
  paletteNote: string;
  leadEssay: string;
  secondaryEssay: string;
  proportions: Array<{ metric: string; spec: string }>;
  swatches: SwatchStudy[];
  guidance: string[];
  image: string;
  categories: string[];
}

const STYLE_CHAPTERS: StyleChapter[] = [
  {
    id: 'quiet-mineral',
    index: '01',
    label: '01. Monolithic Stone',
    title: 'Warm Minimalism & Open-Pore Travertine',
    subtitle: 'Architectural weight anchored by porous Tivoli quarry stone and breathable plaster.',
    readTime: '6 min monograph',
    paletteNote: 'Chalk Lime Plaster · Honed Roman Travertine · Unlacquered Aged Brass',
    leadEssay:
      'For over a decade, high-gloss polished stone dominated luxury residential interiors—reflecting harsh recessed lighting and visually hardening living rooms. Our 2026 study documents a decisive return to honed, unfilled Roman travertine cut parallel to its sedimentary strata in Tivoli.',
    secondaryEssay:
      'When left matte and treated exclusively with plant-based stone wax rather than glossy synthetic resin, porous limestone scatters ambient window light softly across the tabletop. Combined with low chalk plaster plinths and raw unlacquered brass lamps, the room acquires sculptural mass without cold formality.',
    proportions: [
      { metric: 'Coffee Table Clearance', spec: '16–18 in from sofa front rail' },
      { metric: 'Plinth Slab Thickness', spec: '40 mm solid stone or mitered apron' },
      { metric: 'Ambient Luminance', spec: '2700K dimmable warm wash' },
    ],
    swatches: [
      { name: 'Tivoli Ivory Vein-Cut', hex: '#dfd5c6', origin: 'Lazio, Italy', finish: 'Honed Open-Pore Matte' },
      { name: 'Lime Wash Chalk', hex: '#ece6db', origin: 'Mineral Earth', finish: 'Troweled Matte Plaster' },
      { name: 'Unlacquered Satin Brass', hex: '#b6955a', origin: 'Hand-Brushed Solid Bar', finish: 'Living Patina' },
    ],
    guidance: [
      'Anchor open-plan living rooms with a single substantial travertine plinth or coffee table rather than clusters of light side tables.',
      'Pair matte sedimentary stone with soft bouclé curves to soften acoustic reflections inside timber or concrete spaces.',
      'Blot coffee or citrus spills promptly and refresh yearly with neutral beeswax stone balm—never seal with epoxy.',
    ],
    image: '/src/assets/images/hero_lookcreative_living_1794926095098.jpg',
    categories: ['Tables', 'Lighting'],
  },
  {
    id: 'tactile-joinery',
    index: '02',
    label: '02. Nordic Timber',
    title: 'Exposed End-Grain & Botanical Oil Finishes',
    subtitle: 'Structural honesty in European white oak, oiled walnut, and hand-woven paper cord.',
    readTime: '5 min monograph',
    paletteNote: 'Cold-Pressed White Oak · American Black Walnut · Three-Ply Paper Cord',
    leadEssay:
      'In contemporary dining and study rooms, clients are actively rejecting veneered boards and thick polyurethane sprays that disguise timber under plastic sheen. Visible mortise-and-tenon shoulders, proud wooden dowels, and quarter-sawn medullary rays communicate permanence immediately to the hand.',
    secondaryEssay:
      'By bonding pure cold-pressed linseed oil and natural carnauba directly into kiln-dried 7%–9% moisture hardwood, every scratch can be locally hand-buffed at home without factory stripping. Mixing darker American walnut storage credenzas with pale oiled white oak seating gives dining rooms depth without artificial stain dyes.',
    proportions: [
      { metric: 'Dining Perimeter', spec: '36–42 in wall & chair pull-out' },
      { metric: 'Table Width Standard', spec: '38–42 in for generous centerpiece plating' },
      { metric: 'Seat Ergonomics', spec: '18 in seat height · 29.5 in tabletop' },
    ],
    swatches: [
      { name: 'Nordic White Oak', hex: '#c8ab83', origin: 'FSC European Mills', finish: 'Cold-Pressed Botanical Oil' },
      { name: 'American Black Walnut', hex: '#5f4331', origin: 'Appalachian Valley', finish: 'Hand-Rubbed Beeswax' },
      { name: 'Unbleached Paper Cord', hex: '#d8cbb5', origin: 'Denmark', finish: 'Three-Ply Waxed Twist' },
    ],
    guidance: [
      'Specify solid kiln-dried dining tables scaled honestly for 8–10 architectural silhouettes rather than cramped bistro footprints.',
      'Contrast dark oiled walnut fluted credenzas against sunlit pale white oak dining chairs.',
      'Maintain optimal indoor humidity (40%–55%) and apply botanical linseed balm once every twelve months.',
    ],
    image: '/src/assets/images/hero_lookcreative_dining_1794926095951.jpg',
    categories: ['Chairs', 'Storage'],
  },
  {
    id: 'soft-sanctuary',
    index: '03',
    label: '03. Restorative Textiles',
    title: 'Unbleached Belgian Linen & Sculptural Bouclé',
    subtitle: 'Curved lounge profiles and grounded platform beds dressed in undyed natural fibers.',
    readTime: '5 min monograph',
    paletteNote: 'Undyed Oatmeal Flax · Raw French Wool Bouclé · Smoked Oak',
    leadEssay:
      'Sensory quietude in living rooms and bedrooms stems from tonal variation across raw natural fibers rather than loud chromatic contrasts. Unbleached Flemish flax linen and looped ivory wool bouclé absorb ambient clatter while staying breathable against bare skin in every season.',
    secondaryEssay:
      'Rather than wrapping polyurethane foam blocks in polyester batting, our 2026 lounge and bedroom specifications pair removable heavy-gauge linen slipcovers over botanical Dunlop latex cores. Low 12–14 inch platform silhouettes maximize vertical air volume and calm eye-level sightlines upon waking.',
    proportions: [
      { metric: 'Lounge Depth', spec: '36–39 in architectural deep seat' },
      { metric: 'Platform Rail Height', spec: '12–14 in low sanctuary profile' },
      { metric: 'Textile Weight', spec: '540 gsm heavy Belgian flax canvas' },
    ],
    swatches: [
      { name: 'Undyed Oatmeal Linen', hex: '#d4cab9', origin: 'Kortrijk, Belgium', finish: 'Stone-Washed 540 gsm' },
      { name: 'Ivory Merino Bouclé', hex: '#ebe4d6', origin: 'Pyrenees Mills', finish: 'Looped Heavy Weave' },
      { name: 'Smoked Walnut Trim', hex: '#433126', origin: 'North America', finish: 'Matte Satin Wax' },
    ],
    guidance: [
      'Offset rectilinear architectural millwork and bookshelves with at least one generous curved bouclé lounge chair.',
      'Order removable zippered slipcovers in breathable 540 gsm unbleached flax for sunlit family rooms.',
      'Keep bedroom wall finishes within two tonal steps of headboard upholstery to establish unbroken evening calm.',
    ],
    image: '/src/assets/images/hero_lookcreative_bedroom_1794926094097.jpg',
    categories: ['Sofas', 'Bedroom'],
  },
  {
    id: 'sculpted-light',
    index: '04',
    label: '04. Sculpted Light',
    title: 'Layered 2700K Alabaster & Grazing Brass Shadow',
    subtitle: 'Replacing uniform overhead downlights with tactile stone diffusers and floor planes.',
    readTime: '4 min monograph',
    paletteNote: 'Spanish Aragon Alabaster · Burnished Brass · Warm 2700K LED',
    leadEssay:
      'Architectural furniture lives or flattens depending on light direction. Harsh overhead grids wash out timber grain and flatten woven bouclé shadows. Our lighting specification treats lamps as glowing stone architecture positioned strictly below standing eye height.',
    secondaryEssay:
      'Carved from translucent Spanish alabaster whose mineral veining glows amber when lit, pair pendants and slender brushed-brass floor fixtures cast gentle pools of 2700K illumination onto adjacent travertine plinths and linen armchairs—creating natural evening hierarchy across open-plan residences.',
    proportions: [
      { metric: 'Color Temperature', spec: '2700K warm architectural spectrum' },
      { metric: 'Color Rendering', spec: 'CRI 95+ true timber & flax accuracy' },
      { metric: 'Pendant Drop Clearance', spec: '30–34 in above dining table surface' },
    ],
    swatches: [
      { name: 'Aragon Vein Alabaster', hex: '#e9dfd1', origin: 'Zaragoza, Spain', finish: 'Hand-Turned Translucent' },
      { name: 'Burnished Architectural Brass', hex: '#a8874e', origin: 'Machined Solid Tubing', finish: 'Soft Brushed' },
      { name: 'Warm Charcoal Cord', hex: '#2f2d2a', origin: 'Braided Textile', finish: 'Woven Linen Cable' },
    ],
    guidance: [
      'Layer three distinct illumination pools per living zone: one tall floor lamp, one credenza table lamp, and a dimmed ceiling pendant.',
      'Always specify CRI 95+ bulbs so warm travertine and walnut tones never appear muddy or green-shifted at night.',
      'Dim pendants over travertine tables down to 30% during dining to highlight open-pore stone relief.',
    ],
    image: '/src/assets/images/product_brass_floor_lamp_1794926095796.jpg',
    categories: ['Lighting', 'Decor'],
  },
];

export const DesignStyleReportPage: React.FC = () => {
  const { products, navigate } = useStore();
  const [activeId, setActiveId] = useState(STYLE_CHAPTERS[0].id);

  const activeChapter =
    STYLE_CHAPTERS.find((c) => c.id === activeId) || STYLE_CHAPTERS[0];

  const featuredProducts = useMemo(
    () =>
      products
        .filter((p) => activeChapter.categories.includes(p.category))
        .slice(0, 5),
    [products, activeChapter]
  );

  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-14">
      <header className="pb-8 border-b space-y-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
            <BookOpen className="w-4 h-4" />
            <span>Annual Studio Monograph · 2026 Edition</span>
            <span aria-hidden="true">·</span>
            <span>San Francisco &amp; Copenhagen</span>
          </div>
          <h1 className="font-display headline-balance text-3xl sm:text-5xl font-medium">
            2026 Design Style Report
          </h1>
          <p className="text-sm sm:text-base max-w-3xl leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Our annual four-chapter residential specification monograph—documenting how architectural interiors are moving away from glossy synthetic surfaces toward tactile travertine, zero-VOC hardwoods, undyed flax, and low-glare illumination.
          </p>
        </div>

        {/* Publication Overview Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            { label: 'Monograph Chapters', value: '04 Curated Studies' },
            { label: 'Material Swatches', value: '12 Verified Finishes' },
            { label: 'Spatial Rules', value: 'Measured Clearances' },
            { label: 'Published', value: 'Autumn / Winter 2026' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border px-4 py-3"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
              <p className="text-sm font-semibold tabular-nums mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chapter Switcher Tabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          {STYLE_CHAPTERS.map((chap) => {
            const active = chap.id === activeChapter.id;
            return (
              <button
                key={chap.id}
                type="button"
                onClick={() => setActiveId(chap.id)}
                className="px-4 py-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor: active ? 'var(--color-accent)' : 'var(--color-bg-surface)',
                  color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-primary)',
                  borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              >
                {chap.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Active Chapter Deep-Dive Spread */}
      <section
        className="rounded-xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="lg:col-span-5 min-h-[300px] sm:min-h-[420px]">
          <SafeImage src={activeChapter.image} alt={activeChapter.title} className="w-full h-full object-cover" />
        </div>

        <div className="lg:col-span-7 p-7 sm:p-11 flex flex-col justify-between gap-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
              <span>Chapter {activeChapter.index}</span>
              <span aria-hidden="true">·</span>
              <span>{activeChapter.readTime}</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-display headline-balance text-2xl sm:text-4xl font-medium leading-tight">
                {activeChapter.title}
              </h2>
              <p className="text-sm sm:text-base font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {activeChapter.subtitle}
              </p>
            </div>

            <div className="space-y-3 text-sm sm:text-[15px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              <p>{activeChapter.leadEssay}</p>
              <p>{activeChapter.secondaryEssay}</p>
            </div>

            {/* Swatch Study Grid */}
            <div className="space-y-2.5 pt-2">
              <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
                Curated Material Swatches · {activeChapter.paletteNote}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeChapter.swatches.map((swatch) => (
                  <div
                    key={swatch.name}
                    className="rounded-lg border p-3.5 flex items-start gap-3"
                    style={{
                      backgroundColor: 'var(--color-bg-surface-alt)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-md border shrink-0 mt-0.5"
                      style={{
                        backgroundColor: swatch.hex,
                        borderColor: 'var(--color-border)',
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight">{swatch.name}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {swatch.origin} · {swatch.finish}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Measured Proportion Rules */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {activeChapter.proportions.map((prop) => (
                <div key={prop.metric}>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{prop.metric}</p>
                  <p className="text-sm font-semibold tabular-nums mt-0.5">{prop.spec}</p>
                </div>
              ))}
            </div>

            {/* Architect Field Notes */}
            <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Specification Guidance
              </p>
              <ul className="space-y-2 text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {activeChapter.guidance.map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5">
                    <Compass className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => navigate({ page: 'collections' })}
              className="vespera-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Room Collections</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'contact' })}
              className="px-5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Request Swatch &amp; Trade Dossier
            </button>
          </div>
        </div>
      </section>

      {/* Complete 4-Chapter Summary Index */}
      <section className="space-y-5">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
            Full Report Index
          </p>
          <h2 className="font-display text-2xl font-medium mt-1">All 2026 Aesthetic Directions</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STYLE_CHAPTERS.map((chap) => {
            const isCurrent = chap.id === activeChapter.id;
            return (
              <button
                key={chap.id}
                type="button"
                onClick={() => setActiveId(chap.id)}
                className="rounded-xl border p-5 text-left space-y-2 transition-colors cursor-pointer"
                style={{
                  backgroundColor: isCurrent ? 'var(--color-bg-surface-alt)' : 'var(--color-bg-surface)',
                  borderColor: isCurrent ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              >
                <p className="text-xs font-semibold tabular-nums" style={{ color: 'var(--color-brass)' }}>
                  Chapter {chap.index} · {chap.readTime}
                </p>
                <h3 className="font-display text-lg font-medium leading-snug">{chap.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {chap.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="space-y-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
                Specified in Chapter {activeChapter.index}
              </p>
              <h2 className="font-display text-2xl font-medium mt-1">
                Pieces Defining {activeChapter.label.replace(/^\d+\.\s*/, '')}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate({ page: 'shop', category: 'All' })}
              className="text-xs sm:text-sm font-medium underline underline-offset-4 cursor-pointer"
            >
              View Full Catalog
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

interface InnovationPillar {
  index: string;
  discipline: string;
  title: string;
  conventionalFlaw: string;
  solution: string;
  specs: Array<{ label: string; value: string }>;
  benefit: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
}

const INNOVATION_PILLARS: InnovationPillar[] = [
  {
    index: '01',
    discipline: 'Botanical Surface Chemistry',
    title: 'Zero-VOC Cold-Pressed Oil Finishes',
    conventionalFlaw:
      'Most commercial furniture coats hardwood under petrochemical polyurethane spray—creating a brittle plastic skin that traps scratches, yellows in sunlight, and emits volatile organic compounds.',
    solution:
      'Our Copenhagen and Northern California finishing rooms cure pure cold-pressed flaxseed oil blended with carnauba and natural beeswax directly into open wood pores, leaving the timber warm, tactile, and breathable.',
    specs: [
      { label: 'VOC Emission', value: '0 g/L Certified' },
      { label: 'Cure Conditioning', value: '72 hrs natural oxidation' },
      { label: 'Home Spot Repair', value: '< 5 mins with wax pad' },
    ],
    benefit: 'Scratches buff out locally at home without industrial stripping or toxic odors.',
    icon: Leaf,
  },
  {
    index: '02',
    discipline: 'Circular Hardware Architecture',
    title: 'Demountable Solid Brass & Wedged Tenons',
    conventionalFlaw:
      'Mass-produced frames rely on pneumatic steel staples, MDF corner blocks, and irreversible PVA glue—rendering a loose joint impossible to service after ten years.',
    solution:
      'Every Vespera sofa platform, dining apron, and bed rail combines precision-milled hardwood wedged mortise-and-tenon joinery with machine-threaded solid brass inserts rated for repeated torque cycles.',
    specs: [
      { label: 'Bolt Interface', value: 'M8 Solid Machined Brass' },
      { label: 'Joinery Tolerance', value: '±0.2 mm CNC + hand fit' },
      { label: 'Disassembly Time', value: '15 mins single hex key' },
    ],
    benefit: 'Creak-free rigidity that can be tightened after decades or cleanly dismantled when moving.',
    icon: Layers,
  },
  {
    index: '03',
    discipline: 'Breathable Seating Ergonomics',
    title: 'GOLS Natural Latex, Horsehair & Flax Cores',
    conventionalFlaw:
      'Standard synthetic polyurethane cushions compress unevenly within 3–5 years, trap body heat, and depend on synthetic flame retardants.',
    solution:
      'We build progressive-firmness cushion architectures around GOLS-certified organic Dunlop botanical latex wrapped in lofted European flax batting and double-stitched 540 gsm linen ticking.',
    specs: [
      { label: 'Core Density', value: '85 kg/m³ Dunlop Latex' },
      { label: 'Shape Retention', value: '15+ years active rebound' },
      { label: 'Petrochemical Foam', value: '0% across seating line' },
    ],
    benefit: 'Tailored support that breathes year-round and resists permanent seat sagging.',
    icon: Sparkles,
  },
  {
    index: '04',
    discipline: 'Kiln & Quarry Traceability',
    title: 'Serialized Timber Moisture & Brass Provenance',
    conventionalFlaw:
      'Untraced imported lumber frequently ships at 12%–15% ambient moisture, leading to warping, split tabletops, and cupped drawers once placed in climate-controlled residences.',
    solution:
      'Every white oak and black walnut board spends 14 days acclimating to 7%–9% equilibrium moisture prior to milling. A stamped underside brass plaque ties every piece to its exact timber batch and quarry bench.',
    specs: [
      { label: 'Kiln Target', value: '7.5% – 8.5% Moisture' },
      { label: 'Timber Grade', value: 'FAS / Select Quarter-Sawn' },
      { label: 'Structural Guarantee', value: '10 Years Residential' },
    ],
    benefit: 'Dimensional tabletop stability across dry winters and humid coastal summers.',
    icon: Clock,
  },
];

const MATERIAL_COMPARISON = [
  {
    category: 'Timber Finishing',
    vespera: 'Zero-VOC cold-pressed linseed oil & beeswax; home spot-repairable',
    conventional: 'Plastic polyurethane lacquer film; chips and requires chemical stripping',
  },
  {
    category: 'Structural Frame',
    vespera: 'Solid kiln-dried hardwood (7–9% MC) with brass inserts & wedged tenons',
    conventional: 'Stapled pine & particleboard core glued permanently',
  },
  {
    category: 'Cushion Architecture',
    vespera: 'Organic Dunlop latex core wrapped in breathable European flax batting',
    conventional: 'Petroleum polyurethane foam that flattens and off-gasses',
  },
  {
    category: 'Stone Sealant',
    vespera: 'Vein-cut Roman travertine sealed with breathable matte plant wax',
    conventional: 'Resin-filled glossy stone that clouds when scratched',
  },
  {
    category: 'Aftercare & Lifecycle',
    vespera: 'Removable slipcovers, brass replacement hardware & annual balm kits',
    conventional: 'Single-lifecycle disposal once fabric wears or joints loosen',
  },
];

export const InnovationPage: React.FC = () => {
  const { navigate } = useStore();

  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-14">
      <header className="space-y-8 pb-10 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
              Material Engineering &amp; Craft Research
            </p>
            <h1 className="font-display headline-balance text-3xl sm:text-5xl font-medium leading-tight">
              Engineering Permanence Without Planned Obsolescence
            </h1>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Between our Copenhagen prototyping mill and San Francisco material lab, Vespera engineers architectural furniture from the inside out—replacing disposable staples, synthetic foams, and plastic sprays with botanical oils, breathable latex, and serviceable brass hardware.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate({ page: 'shop', category: 'All' })}
                className="vespera-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Engineered Pieces</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate({ page: 'service' })}
                className="px-5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Request Care &amp; Oil Kit
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[280px] sm:min-h-[380px]">
            <div
              className="w-full h-full rounded-xl overflow-hidden border"
              style={{
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <SafeImage
                src="/src/assets/images/showroom_cph_studio_1794990929649.jpg"
                alt="Copenhagen joinery workshop and prototype furniture gallery"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 4-Column Engineering Benchmarks Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { metric: '0 g/L VOC', note: 'Cold-pressed plant oil & wax chemistry' },
            { metric: '7.5% – 8.5%', note: 'Kiln-conditioned hardwood moisture target' },
            { metric: '85 kg/m³', note: 'Organic Dunlop botanical latex density' },
            { metric: '10 Years', note: 'Residential structural joinery guarantee' },
          ].map((bench) => (
            <div
              key={bench.metric}
              className="rounded-xl border p-5 space-y-1"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p className="font-display text-2xl font-medium tabular-nums" style={{ color: 'var(--color-brass)' }}>
                {bench.metric}
              </p>
              <p className="text-xs leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                {bench.note}
              </p>
            </div>
          ))}
        </div>
      </header>

      {/* Four Engineering Dossiers */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {INNOVATION_PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article
              key={pillar.index}
              className="rounded-xl border p-7 sm:p-8 flex flex-col justify-between gap-6"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--color-brass)' }}>
                    {pillar.index}. {pillar.discipline}
                  </span>
                  <Icon className="w-5 h-5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-medium leading-tight">
                  {pillar.title}
                </h2>

                <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  <p>
                    <strong style={{ color: 'var(--color-text-primary)' }}>The Industry Shortcut: </strong>
                    {pillar.conventionalFlaw}
                  </p>
                  <p>
                    <strong style={{ color: 'var(--color-text-primary)' }}>Vespera Architecture: </strong>
                    {pillar.solution}
                  </p>
                </div>

                {/* Spec Strip */}
                <div
                  className="grid grid-cols-3 gap-3 pt-4 border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  {pillar.specs.map((spec) => (
                    <div key={spec.label}>
                      <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        {spec.label}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold tabular-nums mt-0.5">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="p-4 rounded-lg border text-xs sm:text-sm flex items-start gap-2.5"
                style={{
                  backgroundColor: 'var(--color-bg-surface-alt)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-brass)' }} />
                <span>{pillar.benefit}</span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Material Comparison Matrix */}
      <section className="space-y-5">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
            Technical Audit
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-medium mt-1">
            Vespera Atelier Standard vs. Conventional Production
          </h2>
        </div>

        <div
          className="rounded-xl border overflow-x-auto"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-surface-alt)' }}>
                <th className="py-3.5 px-5 text-xs font-semibold">Component Layer</th>
                <th className="py-3.5 px-5 text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
                  Vespera Atelier Specification
                </th>
                <th className="py-3.5 px-5 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  Mass-Market Furniture Norm
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {MATERIAL_COMPARISON.map((row) => (
                <tr key={row.category}>
                  <td className="py-4 px-5 font-medium whitespace-nowrap">{row.category}</td>
                  <td className="py-4 px-5">{row.vespera}</td>
                  <td className="py-4 px-5" style={{ color: 'var(--color-text-muted)' }}>
                    {row.conventional}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="rounded-xl border p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          backgroundColor: 'var(--color-bg-surface-alt)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="space-y-1.5 max-w-2xl">
          <h2 className="font-display text-2xl font-medium">
            Need architectural specifications, CAD tear sheets, or physical swatches?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Contact our material research desk for 3D Rhino/Revit models, CAL-133 flammability compliance certificates, or complimentary kiln-dried timber &amp; stone boxes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate({ page: 'contact' })}
            className="vespera-btn-primary px-6 py-3 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Contact Engineering Desk
          </button>
          <button
            type="button"
            onClick={() => navigate({ page: 'style-report' })}
            className="px-5 py-3 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            Read 2026 Style Report
          </button>
        </div>
      </section>
    </main>
  );
};

