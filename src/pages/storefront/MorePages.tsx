import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Heart,
  HelpCircle,
  History,
  MapPin,
  Phone,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SafeImage } from '../../components/common/SafeImage';
import { ProductCard } from '../../components/storefront/ProductCard';

interface ShowroomLocation {
  id: string;
  city: string;
  district: string;
  title: string;
  address: string;
  hours: string;
  phone: string;
  floorArea: string;
  swatchCount: string;
  transitNote: string;
  narrative: string;
  specialist: string;
  image: string;
  imageAlt: string;
  experiences: Array<{ label: string; detail: string }>;
}

const SHOWROOM_LOCATIONS: ShowroomLocation[] = [
  {
    id: 'sf',
    city: 'San Francisco',
    district: 'Jackson Square Historic District',
    title: 'Jackson Square Flagship & Material Archive',
    address: '480 Jackson Street, San Francisco, CA 94111',
    hours: 'Tuesday – Saturday · 10:00 AM – 6:00 PM PST',
    phone: '+1 (415) 799-4210',
    floorArea: '6,400 sq ft',
    swatchCount: '140+ Stone & Timber Samples',
    transitNote: 'Complimentary valet validation at 450 Jackson Garage · Embarcadero BART (8 min walk)',
    narrative:
      'Set inside a restored 1907 brick-and-timber firehouse with north-facing clerestory skylights, our flagship showroom displays complete living, dining, and bedroom environments under true San Francisco coastal daylight.',
    specialist: 'Henrik Lindahl, Flagship Gallery Director',
    image: '/src/assets/images/showroom_sf_gallery_1794990927911.jpg',
    imageAlt: 'San Francisco Jackson Square Flagship furniture showroom with skylights, travertine plinths, and material archive cabinet',
    experiences: [
      { label: 'Full Room Vignettes', detail: 'Living, Dining, Study & Primary Bedroom layouts at true residential scale' },
      { label: 'Material Archive', detail: 'Compare 140+ Belgian flax, bouclé, oak, walnut, and Roman travertine blocks' },
      { label: 'Trade Library', detail: 'Private project table with CAD drawings, light testing & finish consultation' },
      { label: 'Arrival & Access', detail: 'Step-free street access; walk-ins welcome Tue–Sat or book private sessions' },
    ],
  },
  {
    id: 'ny',
    city: 'New York',
    district: 'SoHo Cast-Iron Historic Loft',
    title: 'SoHo Cast-Iron Viewing Loft',
    address: '92 Mercer Street, Suite 4B, New York, NY 10012',
    hours: 'Tuesday – Saturday · 11:00 AM – 7:00 PM EST',
    phone: '+1 (212) 641-9908',
    floorArea: '4,200 sq ft',
    swatchCount: '95+ Textile & Lighting Samples',
    transitNote: 'Freight elevator access · Spring St (C/E/6) and Prince St (R/W) within two blocks',
    narrative:
      'Housed on the fourth floor of an 1894 SoHo cast-iron building with 14-foot ceilings and original pine joists, our New York viewing loft highlights warm 2700K Aragon alabaster lighting, fluted walnut cabinetry, and upholstered seating silhouettes.',
    specialist: 'Claire Beaumont, Senior Architectural Advisor',
    image: '/src/assets/images/showroom_ny_loft_1794990929170.jpg',
    imageAlt: 'New York SoHo cast-iron loft furniture showroom with trade swatch table, fluted walnut credenza, and tall mullioned windows',
    experiences: [
      { label: 'Illumination Gallery', detail: 'Live dimming suite comparing Aragon alabaster & brushed brass fixtures' },
      { label: 'Floor-Plan Desk', detail: 'Bring Manhattan apartment or townhouse floor plans for clearance scaling' },
      { label: 'Courier Swatch Kits', detail: 'Same-day local courier dispatches across Manhattan & Brooklyn studios' },
      { label: 'Private Loft Visits', detail: 'Ring Suite 4B intercom or book an after-hours trade presentation' },
    ],
  },
  {
    id: 'cph',
    city: 'Copenhagen',
    district: 'Frederiksstaden Prototyping Quarter',
    title: 'Nordic Joinery & Prototype Studio',
    address: 'Bredgade 45, 1260 København K, Denmark',
    hours: 'Monday – Friday · By Private Appointment (CET)',
    phone: '+45 33 14 82 90',
    floorArea: '3,800 sq ft',
    swatchCount: 'Mill Timber Vault & Loom Library',
    transitNote: 'Marmorkirken Metro (M3/M4 · 3 min walk) · Courtyard bicycle & courier bay',
    narrative:
      'Tucked behind an 18th-century Bredgade plaster courtyard, our Copenhagen studio bridges exhibition gallery and active prototype workshop—housing full-scale steam-bent white oak mockups, raw timber planks, and paper-cord weaving benches.',
    specialist: 'Søren Møller, Master Chairmaker & Mill Lead',
    image: '/src/assets/images/showroom_cph_studio_1794990929649.jpg',
    imageAlt: 'Copenhagen Nordic joinery showroom with plaster arches, solid oak dining tables, paper-cord chairs, and workshop view',
    experiences: [
      { label: 'Joinery Inspection', detail: 'Inspect wedged mortise-and-tenon joints and brass hardware before finishing' },
      { label: 'Custom Table Sizing', detail: 'Commission bespoke 10–12 seat oak & travertine dining lengths directly' },
      { label: 'Paper-Cord Bench', detail: 'Observe traditional Danish three-ply cord tensioning live in studio' },
      { label: 'European Freight', detail: 'Direct white-glove dispatch coordination across EU & UK destinations' },
    ],
  },
];

export const ShowroomsPage: React.FC = () => {
  const { navigate, userProfile } = useStore();
  const [bookingRoom, setBookingRoom] = useState<ShowroomLocation | null>(null);
  const [visitDate, setVisitDate] = useState('2026-12-05');
  const [visitSlot, setVisitSlot] = useState('11:00 AM');
  const [visitFocus, setVisitFocus] = useState('Living & Dining Material Swatches');
  const [visitorName, setVisitorName] = useState(userProfile?.name || '');
  const [visitorEmail, setVisitorEmail] = useState(userProfile?.email || '');
  const [confirmedAppointments, setConfirmedAppointments] = useState<
    Record<string, { code: string; date: string; slot: string }>
  >({});

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRoom || !visitorName.trim() || !visitorEmail.trim()) return;
    const code = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedAppointments((prev) => ({
      ...prev,
      [bookingRoom.id]: { code, date: visitDate, slot: visitSlot },
    }));
    setBookingRoom(null);
  };

  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-14">
      <header className="pb-8 border-b space-y-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
            Galleries &amp; Material Archives
          </p>
          <h1 className="font-display headline-balance text-3xl sm:text-5xl font-medium">
            Atelier Showrooms
          </h1>
          <p className="text-sm sm:text-base max-w-3xl leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Furniture decisions rely on touch, scale, and daylight. Visit our three architectural galleries in San Francisco, New York, and Copenhagen to test seat pitch, examine open-pore Roman travertine slabs, and bring home physical oak, walnut, and Belgian linen samples.
          </p>
        </div>

        {/* 3-Showroom At-a-Glance Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {SHOWROOM_LOCATIONS.map((room) => (
            <a
              key={room.id}
              href={`#showroom-${room.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`showroom-${room.id}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-xl border p-5 flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
                  {room.city} · {room.floorArea}
                </p>
                <p className="font-display text-lg font-medium mt-0.5">{room.title}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {room.swatchCount}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 opacity-60" />
            </a>
          ))}
        </div>
      </header>

      {/* Detailed Showroom Gallery Cards */}
      <div className="space-y-12">
        {SHOWROOM_LOCATIONS.map((room) => {
          const appointment = confirmedAppointments[room.id];
          return (
            <section
              id={`showroom-${room.id}`}
              key={room.id}
              className="rounded-xl border overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="lg:col-span-5 min-h-[280px] sm:min-h-[400px]">
                <SafeImage src={room.image} alt={room.imageAlt} className="w-full h-full object-cover" />
              </div>

              <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-between gap-7">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold" style={{ color: 'var(--color-brass)' }}>
                      {room.city} · {room.district}
                    </span>
                    <span className="tabular-nums font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      {room.floorArea} · {room.swatchCount}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-display text-2xl sm:text-3xl font-medium">
                      {room.title}
                    </h2>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      Hosted by {room.specialist}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {room.narrative}
                  </p>

                  {/* On-Site Experience Grid */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {room.experiences.map((exp) => (
                      <div key={exp.label} className="space-y-0.5">
                        <p className="text-xs font-semibold">{exp.label}</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                          {exp.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Logistics & Transit Info */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t text-xs sm:text-sm"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                  >
                    <p className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                      <span>{room.address}</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                      <span>{room.hours}</span>
                    </p>
                    <p className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-brass)' }} />
                      <span className="tabular-nums">{room.phone}</span>
                    </p>
                    <p className="text-xs leading-relaxed">
                      <strong style={{ color: 'var(--color-text-primary)' }}>Arrival: </strong>
                      {room.transitNote}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  {appointment ? (
                    <button
                      type="button"
                      onClick={() => setBookingRoom(room)}
                      className="px-5 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                      style={{
                        borderColor: 'var(--color-accent)',
                        backgroundColor: 'var(--color-bg-surface-alt)',
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>
                        Booked {appointment.date} at {appointment.slot} ({appointment.code})
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setBookingRoom(room)}
                      className="vespera-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Book Private Appointment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate({ page: 'collections' })}
                    className="px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    View Room Collections
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Preparing for Your Visit Strip */}
      <section
        className="rounded-xl border p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        style={{
          backgroundColor: 'var(--color-bg-surface-alt)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="lg:col-span-7 space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
            Consultation Preparation
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-medium">
            Making the Most of Your Gallery Session
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Bring room dimensions, architectural floor plans, wall paint drawdowns, or flooring samples so our advisors can lay oak, walnut, and flax weaves alongside your exact interior palette. Can’t visit in person? Request a curated swatch kit dispatched directly to your home or design studio.
          </p>
        </div>
        <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate({ page: 'contact' })}
            className="vespera-btn-primary px-5 py-3 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Order Swatch Kit by Mail
          </button>
          <button
            type="button"
            onClick={() => navigate({ page: 'events' })}
            className="px-5 py-3 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            Explore Upcoming Events
          </button>
        </div>
      </section>

      {/* Appointment Booking Modal */}
      {bookingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Book Showroom Appointment">
          <div className="fixed inset-0 bg-black/45" onClick={() => setBookingRoom(null)} />
          <div
            className="relative w-full max-w-lg rounded-xl border p-6 space-y-5 shadow-2xl"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-brass)' }}>
                  {bookingRoom.city} · Private Gallery Session
                </p>
                <h3 className="font-display text-xl font-medium mt-0.5">{bookingRoom.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setBookingRoom(null)}
                aria-label="Close appointment dialog"
                className="p-1.5 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
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
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    placeholder="elena@studio.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent font-mono-tabular"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Time Window</label>
                  <select
                    value={visitSlot}
                    onChange={(e) => setVisitSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-surface)]"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <option value="11:00 AM">11:00 AM (Morning Daylight)</option>
                    <option value="2:00 PM">2:00 PM (Afternoon Consultation)</option>
                    <option value="4:30 PM">4:30 PM (Evening Illumination)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Session Focus</label>
                <select
                  value={visitFocus}
                  onChange={(e) => setVisitFocus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-surface)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <option>Living &amp; Dining Material Swatches</option>
                  <option>Full Residence Floor-Plan Review</option>
                  <option>Bespoke Timber &amp; Stone Table Sizing</option>
                  <option>Trade Practice Orientation</option>
                </select>
              </div>

              <button
                type="submit"
                className="vespera-btn-primary w-full py-3 text-sm font-semibold cursor-pointer"
              >
                Confirm Private Appointment
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export const ServiceRequestPage: React.FC = () => {
  const { userProfile, navigate } = useStore();

  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [orderNumber, setOrderNumber] = useState('');
  const [serviceType, setServiceType] = useState('Timber Oil & Refinishing Kit');
  const [details, setDetails] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !details.trim()) return;
    setTicketId(`SRV-${Math.floor(1000 + Math.random() * 9000)}`);
    setOrderNumber('');
    setDetails('');
  };

  return (
    <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
              Stewardship &amp; Aftercare
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-medium">
              Service Request
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Every Vespera Atelier piece includes our 10-year structural joinery warranty. Request plant-oil care kits, upholstery servicing, hardware replacements, or white-glove delivery adjustments below.
            </p>
          </div>

          <div
            className="rounded-xl border p-6 space-y-4 text-sm"
            style={{
              backgroundColor: 'var(--color-bg-surface-alt)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 font-semibold">
              <Wrench className="w-4 h-4" style={{ color: 'var(--color-brass)' }} />
              <span>Covered Studio Services</span>
            </div>
            <ul className="space-y-2 text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              <li>• Complimentary replacement hardware &amp; leveler glides</li>
              <li>• Annual plant-oil &amp; travertine stone sealer replenishment kits</li>
              <li>• Freight transit inspection &amp; white-glove placement support</li>
              <li>• Slipcover tailoring &amp; bouclé deep-cleaning guidance</li>
            </ul>
            <button
              type="button"
              onClick={() => navigate({ page: 'track' })}
              className="text-xs font-semibold underline underline-offset-4 cursor-pointer"
            >
              Checking shipment status? Open Order Tracker →
            </button>
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
          {ticketId ? (
            <div className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <p className="text-xs font-mono-tabular font-semibold" style={{ color: 'var(--color-brass)' }}>
                Reference #{ticketId}
              </p>
              <h2 className="font-display text-2xl font-medium">
                Service Request Logged
              </h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                Our client stewardship team will contact you by phone or email within 24 business hours with next steps.
              </p>
              <button
                type="button"
                onClick={() => setTicketId(null)}
                className="vespera-btn-primary px-5 py-2.5 text-xs font-semibold cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-xl font-medium">Submit Service Ticket</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Full Name</label>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-medium mb-1">Order Number (Optional)</label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. VSP-1046"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent font-mono-tabular"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-surface)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <option>Timber Oil &amp; Refinishing Kit</option>
                  <option>Warranty Joinery Inspection</option>
                  <option>Upholstery &amp; Cushion Care</option>
                  <option>Delivery Window Reschedule</option>
                  <option>Freight / Transit Damage Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Request Details</label>
                <textarea
                  required
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe the piece, finish, or service assistance needed..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border bg-transparent"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>

              <button
                type="submit"
                className="vespera-btn-primary px-6 py-3 text-sm font-semibold cursor-pointer"
              >
                Submit Service Request
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

interface FaqItem {
  id: string;
  topic: 'Ordering' | 'Delivery' | 'Care' | 'Warranty';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    topic: 'Delivery',
    question: 'What is included with White-Glove Delivery & Assembly?',
    answer:
      'Our regional two-person freight team carries your pieces into the room of your choice, performs full joinery or bed-frame assembly, levels credenzas and tables on your flooring, and removes all wooden crating and protective blankets.',
  },
  {
    id: 'faq-2',
    topic: 'Ordering',
    question: 'What are typical production and dispatch lead times?',
    answer:
      'In-stock lighting, textiles, and accent chairs ship within 48 hours to 5 business days. Larger timber dining tables, travertine pieces, and slipcovered sofas dispatch within 7 to 14 business days via scheduled freight.',
  },
  {
    id: 'faq-3',
    topic: 'Care',
    question: 'How do I care for zero-VOC oiled oak and American walnut?',
    answer:
      'Dust weekly with a dry microfiber cloth and wipe spills promptly with a damp cotton rag. Once every 12 to 18 months, nourish the open timber grain using Vespera cold-pressed linseed & beeswax balm included with your order.',
  },
  {
    id: 'faq-4',
    topic: 'Care',
    question: 'Does honed Roman travertine stain easily?',
    answer:
      'Each travertine table slab is pre-sealed at our atelier with a breathable matte stone wax that resists water, coffee, and wine for several hours. Avoid acidic citrus cleaners and blot dark liquids promptly with warm water.',
  },
  {
    id: 'faq-5',
    topic: 'Warranty',
    question: 'What does your 10-year structural warranty cover?',
    answer:
      'All solid hardwood frames, wedged mortise-and-tenon joints, concealed brass cleats, and slatted bed decks are guaranteed against structural failure under residential use for ten full years.',
  },
  {
    id: 'faq-6',
    topic: 'Ordering',
    question: 'Can I preview fabric and stone swatches before ordering?',
    answer:
      'Yes. Request complimentary Belgian flax, wool bouclé, and timber swatches through our Contact page or visit our San Francisco, New York, or Copenhagen showrooms in person.',
  },
  {
    id: 'faq-7',
    topic: 'Delivery',
    question: 'How can I track my furniture shipment in real time?',
    answer:
      'Visit our Track Order page and enter your order reference (for example, VSP-1047) or view live milestones inside your Account Order History.',
  },
  {
    id: 'faq-8',
    topic: 'Warranty',
    question: 'How do returns and exchanges work for furniture orders?',
    answer:
      'Unused standard collection pieces may be returned or exchanged within 30 days of delivery. Contact our Service Request desk or Concierge team to schedule pickup with our regional carrier.',
  },
];

export const HelpFaqPage: React.FC = () => {
  const { navigate } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<'All' | FaqItem['topic']>('All');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      if (activeTopic !== 'All' && item.topic !== activeTopic) return false;
      if (
        q &&
        !item.question.toLowerCase().includes(q) &&
        !item.answer.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [searchQuery, activeTopic]);

  return (
    <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-10">
      <header className="pb-8 border-b space-y-3" style={{ borderColor: 'var(--color-border)' }}>
        <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
          Help Center &amp; Questions / Answers
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-medium">
          How Can We Help?
        </h1>
        <p className="text-sm sm:text-base max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>
          Browse clear answers regarding lead times, white-glove delivery, timber and travertine care, financing, and our 10-year joinery warranty.
        </p>
      </header>

      {/* Search + Topic Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. travertine, warranty, delivery)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-[var(--color-bg-surface)]"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['All', 'Ordering', 'Delivery', 'Care', 'Warranty'] as const).map((topic) => {
            const active = activeTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setActiveTopic(topic)}
                className="px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer"
                style={{
                  backgroundColor: active ? 'var(--color-accent)' : 'var(--color-bg-surface)',
                  color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-primary)',
                  borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                }}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion Q&A List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div
            className="rounded-xl border p-10 text-center space-y-3"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <HelpCircle className="w-8 h-8 mx-auto opacity-35" />
            <p className="font-display text-lg font-medium">No matching answers found</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Try a different keyword or reach out directly to our Concierge team.
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-black/[0.02] transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--color-brass)' }}>
                      {faq.topic}
                    </span>
                    <h2 className="font-display text-lg sm:text-xl font-medium">
                      {faq.question}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    className="px-6 pb-5 pt-2 border-t text-sm leading-relaxed"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Need Further Assistance Bar */}
      <section
        className="rounded-xl border p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          backgroundColor: 'var(--color-bg-surface-alt)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-medium">Still have a question?</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Speak with our concierge desk or submit a formal care or repair ticket.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate({ page: 'service' })}
            className="vespera-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Open Service Request
          </button>
          <button
            type="button"
            onClick={() => navigate({ page: 'contact' })}
            className="px-5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
            style={{ borderColor: 'var(--color-border)' }}
          >
            Contact Studio
          </button>
        </div>
      </section>
    </main>
  );
};

export const RecentlyViewedPage: React.FC = () => {
  const {
    products,
    recentlyViewedIds,
    removeRecentlyViewed,
    clearRecentlyViewed,
    navigate,
  } = useStore();

  const recentProducts = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return recentlyViewedIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [products, recentlyViewedIds]);

  const suggestedPieces = useMemo(
    () => products.filter((p) => p.bestSeller).slice(0, 5),
    [products]
  );

  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-10">
      <header
        className="pb-8 border-b flex flex-col sm:flex-row sm:items-end justify-between gap-5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
            Browsing History
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-medium">
            Recently Viewed
          </h1>
          <p className="text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Revisit the furniture pieces and lighting fixtures you inspected across the atelier catalog.
          </p>
        </div>

        {recentProducts.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
              {recentProducts.length} {recentProducts.length === 1 ? 'piece' : 'pieces'}
            </span>
            <button
              type="button"
              onClick={clearRecentlyViewed}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 transition-colors cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </header>

      {recentProducts.length === 0 ? (
        <div className="space-y-12">
          <section
            className="rounded-xl border p-10 sm:p-14 text-center space-y-5"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg-surface-alt)',
              }}
            >
              <History className="w-5 h-5" style={{ color: 'var(--color-brass)' }} />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="font-display text-2xl font-medium">No recently viewed pieces yet</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Open any piece from the catalog or curated room collections to compare finishes, dimensions, and craftsmanship notes here.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate({ page: 'shop', category: 'All' })}
                className="vespera-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate({ page: 'collections' })}
                className="px-5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                View Room Collections
              </button>
            </div>
          </section>

          {suggestedPieces.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
                    Atelier Highlights
                  </p>
                  <h2 className="font-display text-2xl font-medium mt-1">
                    Popular Pieces to Inspect
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: 'All' })}
                  className="text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
                >
                  <span>Browse All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {suggestedPieces.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {recentProducts.map((product) => (
              <div key={product.id} className="relative group/recent">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentlyViewed(product.id);
                  }}
                  aria-label={`Remove ${product.name} from recently viewed`}
                  title="Remove from history"
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/95 border text-[#1c1b19] flex items-center justify-center shadow-sm opacity-90 sm:opacity-0 sm:group-hover/recent:opacity-100 focus:opacity-100 hover:bg-white transition-opacity cursor-pointer"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <ProductCard product={product} compact />
              </div>
            ))}
          </div>

          <section
            className="rounded-xl border p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
            style={{
              backgroundColor: 'var(--color-bg-surface-alt)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-medium">
                Comparing finishes or room scale?
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Continue browsing the catalog or schedule a private material swatch consultation at our showrooms.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate({ page: 'shop', category: 'All' })}
                className="vespera-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Continue Shopping
              </button>
              <button
                type="button"
                onClick={() => navigate({ page: 'showrooms' })}
                className="px-5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Visit Showrooms
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export const WishlistPage: React.FC = () => {
  const { products, wishlistIds, clearWishlist, navigate } = useStore();

  const savedProducts = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return wishlistIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [products, wishlistIds]);

  const recommendedPieces = useMemo(
    () => products.filter((p) => p.newArrival).slice(0, 5),
    [products]
  );

  return (
    <main className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 space-y-10">
      <header
        className="pb-8 border-b flex flex-col sm:flex-row sm:items-end justify-between gap-5"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wide" style={{ color: 'var(--color-brass)' }}>
            Curated Selection
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-medium">
            Saved Wishlist
          </h1>
          <p className="text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Pieces you have bookmarked for upcoming rooms, material comparison, or white-glove commissioning.
          </p>
        </div>

        {savedProducts.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
              {savedProducts.length} {savedProducts.length === 1 ? 'saved piece' : 'saved pieces'}
            </span>
            <button
              type="button"
              onClick={clearWishlist}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-black/5 transition-colors cursor-pointer"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          </div>
        )}
      </header>

      {savedProducts.length === 0 ? (
        <div className="space-y-12">
          <section
            className="rounded-xl border p-10 sm:p-14 text-center space-y-5"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg-surface-alt)',
              }}
            >
              <Heart className="w-5 h-5" style={{ color: 'var(--color-brass)' }} />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="font-display text-2xl font-medium">Your wishlist is empty</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Tap the heart icon on any furniture piece or lighting design to save it here for side-by-side finish comparisons.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => navigate({ page: 'shop', category: 'All' })}
                className="vespera-btn-primary px-5 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate({ page: 'collections' })}
                className="px-5 py-2.5 rounded-lg border text-xs sm:text-sm font-medium hover:bg-black/5 cursor-pointer"
                style={{ borderColor: 'var(--color-border)' }}
              >
                View Room Collections
              </button>
            </div>
          </section>

          {recommendedPieces.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-brass)' }}>
                    Atelier Releases
                  </p>
                  <h2 className="font-display text-2xl font-medium mt-1">
                    New Arrivals to Bookmark
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'shop', category: 'All' })}
                  className="text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
                >
                  <span>Browse All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                {recommendedPieces.map((product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      )}
    </main>
  );
};
