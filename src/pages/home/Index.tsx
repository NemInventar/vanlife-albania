import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Star, MapPin, CheckCircle, ArrowRight,
  Mountain, Waves, Sun, Calendar, Clock, Shield,
  Phone, Menu, X, ChevronLeft, ChevronRight,
  Send, User, Mail, Smartphone, MessageSquare, PartyPopper
} from 'lucide-react';
import {
  REVIEWS, FAQ_ITEMS, HOW_IT_WORKS, INCLUDED_ITEMS,
  PRICE_PER_NIGHT, scrollToSection, formatPrice
} from '@/lib/index';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

// ─── Image constants ─────────────────────────────────────────────────────────
const VAN_INTERIOR = '/van-interior.png';
const ALBANIA_LANDSCAPE = '/albania-vanlife.png';

// Unsplash lifestyle images (free to use)
const HERO_BG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80';
const COAST_IMG = 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80';
const MOUNTAIN_IMG = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';
const BEACH_IMG = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80';
const ROAD_IMG = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';

const WEB3FORMS_KEY = '8fdfd429-c106-48be-aba0-66ea1f55ada2';

// ─── Booking Calendar Component ───────────────────────────────────────────────
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function isBefore(d1: Date, d2: Date) {
  return d1 < d2;
}
function isSameDay(d1: Date, d2: Date) {
  return d1.toDateString() === d2.toDateString();
}
function daysBetween(d1: Date, d2: Date) {
  return Math.round(Math.abs((d2.getTime() - d1.getTime()) / 86400000));
}

interface CalendarState {
  startDate: Date | null;
  endDate: Date | null;
  selectingEnd: boolean;
}

interface BookingForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

function BookingCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [sel, setSel] = useState<CalendarState>({ startDate: null, endDate: null, selectingEnd: false });
  const [hovered, setHovered] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BookingForm>({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const nights = sel.startDate && sel.endDate ? daysBetween(sel.startDate, sel.endDate) : 0;
  const total = formatPrice(nights);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDayClick(date: Date) {
    if (isBefore(date, today)) return;
    if (!sel.startDate || (sel.startDate && sel.endDate)) {
      setSel({ startDate: date, endDate: null, selectingEnd: true });
      setShowForm(false);
    } else {
      if (isBefore(date, sel.startDate) || isSameDay(date, sel.startDate)) {
        setSel({ startDate: date, endDate: null, selectingEnd: true });
        setShowForm(false);
      } else {
        setSel({ startDate: sel.startDate, endDate: date, selectingEnd: false });
      }
    }
  }

  function isInRange(date: Date) {
    if (!sel.startDate) return false;
    const end = sel.endDate || hovered;
    if (!end) return false;
    return date > sel.startDate && date < end;
  }
  function isStart(date: Date) {
    return sel.startDate ? isSameDay(date, sel.startDate) : false;
  }
  function isEnd(date: Date) {
    return sel.endDate ? isSameDay(date, sel.endDate) : false;
  }
  function isHoveredEnd(date: Date) {
    return hovered && sel.startDate && !sel.endDate ? isSameDay(date, hovered) : false;
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewYear, viewMonth, d));
  }

  function formatDate(d: Date | null) {
    if (!d) return 'Select date';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function handleBookNow() {
    if (!sel.startDate || !sel.endDate) {
      alert('Please select your check-in and check-out dates first.');
      return;
    }
    setShowForm(true);
    setSubmitted(false);
    setSubmitError('');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `🚐 New Booking Request – ${formatDate(sel.startDate)} to ${formatDate(sel.endDate)}`,
          name: form.name,
          email: form.email,
          phone: form.phone || 'Not provided',
          checkin: formatDate(sel.startDate),
          checkout: formatDate(sel.endDate),
          nights: `${nights} night${nights !== 1 ? 's' : ''}`,
          estimated_total: total,
          message: form.message || 'No additional message',
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setSubmitError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Date display */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={`p-3 rounded-xl border-2 transition-all ${sel.startDate ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Check-in</div>
          <div className={`text-sm font-semibold ${sel.startDate ? 'text-foreground' : 'text-muted-foreground'}`}>
            {formatDate(sel.startDate)}
          </div>
        </div>
        <div className={`p-3 rounded-xl border-2 transition-all ${sel.endDate ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Check-out</div>
          <div className={`text-sm font-semibold ${sel.endDate ? 'text-foreground' : 'text-muted-foreground'}`}>
            {formatDate(sel.endDate)}
          </div>
        </div>
      </div>

      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-foreground">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const isPast = isBefore(date, today);
          const isStartDay = isStart(date);
          const isEndDay = isEnd(date);
          const inRange = isInRange(date);
          const isHovEnd = isHoveredEnd(date);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDayClick(date)}
              onMouseEnter={() => sel.selectingEnd && setHovered(date)}
              onMouseLeave={() => setHovered(null)}
              disabled={isPast}
              className={[
                'relative text-center py-2 text-sm font-medium transition-all duration-150 select-none',
                isPast ? 'text-muted-foreground/40 cursor-not-allowed' : 'cursor-pointer hover:bg-primary/10 hover:text-primary',
                isStartDay || isEndDay || isHovEnd ? 'bg-primary text-primary-foreground rounded-lg hover:bg-primary hover:text-primary-foreground' : '',
                inRange ? 'bg-primary/15 text-primary rounded-none' : '',
                isToday && !isStartDay && !isEndDay ? 'font-bold underline decoration-primary' : '',
                !isStartDay && !isEndDay && !inRange && !isHovEnd ? 'rounded-lg' : '',
              ].join(' ')}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Price summary */}
      <AnimatePresence>
        {nights > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-5 p-4 rounded-xl bg-primary/10 border border-primary/20"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">${PRICE_PER_NIGHT} × {nights} night{nights !== 1 ? 's' : ''}</span>
              <span className="font-bold text-lg text-foreground">{total}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-xl text-primary">{total}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleBookNow}
        className="w-full mt-4 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg"
        style={{ boxShadow: '0 4px 20px color-mix(in srgb, var(--primary) 40%, transparent)' }}
      >
        {sel.startDate && sel.endDate ? `Request to Book – ${total}` : 'BOOK NOW'}
      </button>

      <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" /> Free to request · No payment required
      </p>

      {/* ── Booking Request Form ── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
            className="mt-6 border-t border-border pt-6"
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PartyPopper className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Request Sent! 🎉
                </h3>
                <p className="text-muted-foreground text-sm mb-1">
                  We've received your booking request for
                </p>
                <p className="font-semibold text-foreground text-sm mb-4">
                  {formatDate(sel.startDate)} → {formatDate(sel.endDate)} · {nights} nights · {total}
                </p>
                <p className="text-muted-foreground text-sm">
                  We'll reply to your email within a few hours to confirm availability. 🚐
                </p>
                <button
                  onClick={() => { setShowForm(false); setSubmitted(false); setSel({ startDate: null, endDate: null, selectingEnd: false }); }}
                  className="mt-5 text-sm text-primary font-medium underline"
                >
                  Make another request
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    Complete your booking request
                  </p>
                  {/* Summary pill */}
                  <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-xl mb-4 text-sm">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">
                      {formatDate(sel.startDate)} → {formatDate(sel.endDate)}
                    </span>
                    <span className="ml-auto font-bold text-primary">{total}</span>
                  </div>
                </div>

                {/* Name */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Your full name *"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Your email address *"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="Phone / WhatsApp (optional)"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                {/* Message */}
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <textarea
                    placeholder="Any questions or special requests? (optional)"
                    rows={3}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  />
                </div>

                {submitError && (
                  <p className="text-destructive text-xs px-1">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 4px 20px color-mix(in srgb, var(--primary) 40%, transparent)' }}
                >
                  {submitting ? (
                    <><span className="animate-spin">⏳</span> Sending Request...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Booking Request</>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  No payment required. We'll reply within a few hours.
                </p>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sticky Book Bar ─────────────────────────────────────────────────────────
function StickyBookBar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={springPresets.gentle}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="bg-card border-t border-border shadow-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <span className="font-bold text-xl text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                $130
              </span>
              <span className="text-muted-foreground text-sm"> / night</span>
            </div>
            <button
              onClick={() => scrollToSection('booking')}
              className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm"
            >
              Check Availability
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { label: 'Experience', id: 'experience' },
    { label: "What's Included", id: 'included' },
    { label: 'Reviews', id: 'reviews' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-card/95 border-b border-border shadow-sm' : 'bg-transparent'}`}
      style={{ backdropFilter: scrolled ? 'blur(12px)' : undefined }}>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚐</span>
          <span className={`font-bold text-lg tracking-tight ${scrolled ? 'text-foreground' : 'text-white'}`}
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Vanlife<span className="text-primary"> Albania</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => scrollToSection(l.id)}
              className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? 'text-foreground' : 'text-white/90'}`}
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => scrollToSection('booking')}
            className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-sm transition-all hover:opacity-90"
          >
            Book Now
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen
            ? <X className={scrolled ? 'text-foreground' : 'text-white'} />
            : <Menu className={scrolled ? 'text-foreground' : 'text-white'} />
          }
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {links.map(l => (
                <button
                  key={l.id}
                  onClick={() => { scrollToSection(l.id); setMenuOpen(false); }}
                  className="text-left font-medium py-2 text-foreground hover:text-primary transition-colors"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => { scrollToSection('booking'); setMenuOpen(false); }}
                className="mt-2 py-3 bg-primary text-primary-foreground font-bold rounded-xl"
              >
                Book Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
      ))}
    </div>
  );
}

// ─── Section Heading ─────────────────────────────────────────────────────────
function SectionHeading({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-widest mb-4">
        {label}
      </span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}>
        {title}
      </h2>
      {subtitle && <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          layout
          className="border border-border rounded-2xl overflow-hidden bg-card"
        >
          <button
            className="w-full flex items-center justify-between p-5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-foreground pr-4">{item.q}</span>
            <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-muted-foreground leading-relaxed">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const handleBookNow = useCallback(() => scrollToSection('booking'), []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <StickyBookBar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={ALBANIA_LANDSCAPE}
            alt="Albania vanlife adventure"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm font-medium mb-6">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Albania · Fully Equipped · Guide Included
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Freedom. Nature.<br />
            <span className="text-primary">Adventure.</span><br />
            All in One Van.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.35 }}
            className="text-xl md:text-2xl text-white/85 mb-10 max-w-2xl mx-auto"
          >
            Fully equipped campervan + exclusive Albania travel guide included.
            <br className="hidden md:block" />
            <span className="text-primary font-semibold"> The easiest way to experience vanlife in Albania.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleBookNow}
              className="px-10 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl transition-all hover:opacity-90 active:scale-[0.97] shadow-2xl"
              style={{ boxShadow: '0 8px 32px color-mix(in srgb, var(--primary) 50%, transparent)' }}
            >
              BOOK NOW →
            </button>
            <button
              onClick={() => scrollToSection('experience')}
              className="px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold text-lg rounded-2xl transition-all hover:bg-white/20"
            >
              Explore the Experience
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-white/60 text-sm flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4 text-destructive" />
            <span className="text-destructive font-semibold">Limited availability each month</span>
            — Secure your dates today
          </motion.p>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6 text-white/60" />
        </motion.div>
      </section>

      {/* ── SOCIAL PROOF BANNER ───────────────────────────────────────────── */}
      <section className="bg-card border-y border-border py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <Stars />
              <div>
                <div className="font-bold text-foreground text-sm">4.98 / 5 Rating</div>
                <div className="text-xs text-muted-foreground">100+ travelers</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <div>
                <div className="font-bold text-foreground text-sm">Loved Across Europe</div>
                <div className="text-xs text-muted-foreground">DE · IT · UK · NL · ES · FR</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-secondary" />
              <div>
                <div className="font-bold text-foreground text-sm">Ready-to-Go Roadtrip</div>
                <div className="text-xs text-muted-foreground">Everything included</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-primary" />
              <div>
                <div className="font-bold text-foreground text-sm">Exclusive Travel Guide</div>
                <div className="text-xs text-muted-foreground">Hidden spots + exact routes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE EXPERIENCE ────────────────────────────────────────────────── */}
      <section id="experience" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            label="The Vanlife Experience"
            title="This Is How Albania Was Meant to Be Seen"
            subtitle="No hotels. No schedules. No stress. Just you, the road, and some of Europe's most spectacular scenery."
          />

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: <Waves className="w-8 h-8 text-primary" />,
                image: BEACH_IMG,
                title: 'Wake Up by the Sea',
                desc: "Park on the cliff above the Ionian coast. Open the van doors to turquoise water and total silence. No alarm, no rush.",
              },
              {
                icon: <Mountain className="w-8 h-8 text-primary" />,
                image: MOUNTAIN_IMG,
                title: 'Drive Through Mountains',
                desc: 'The Albanian Alps and Valbona Valley are unlike anything in Europe. Winding mountain roads with zero crowds — just you and the peaks.',
              },
              {
                icon: <Sun className="w-8 h-8 text-primary" />,
                image: ROAD_IMG,
                title: 'Live at Your Own Pace',
                desc: 'No check-in times. No hotel bills. No noise. Stay where you want, as long as you want. Total freedom is the only itinerary.',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ ...springPresets.gentle, delay: i * 0.1 }}
                className="group rounded-3xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 p-2 bg-card/90 rounded-xl">
                    {card.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Van interior showcase */}
          <div className="grid md:grid-cols-2 gap-8 items-center rounded-3xl overflow-hidden bg-card border border-border p-0 md:p-0">
            <div className="relative h-72 md:h-full min-h-[300px] overflow-hidden">
              <img
                src={VAN_INTERIOR}
                alt="Van interior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 md:p-10">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                Your Mobile Home
              </span>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                A Roadtrip, Fully Prepared
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Step in and everything's ready. Comfortable bed. Full kitchen. All the gear you need.
                It's not just a rental — it's a ready-to-go roadtrip with everything thought of in advance.
              </p>
              <ul className="space-y-2">
                {['Raised double bed with quality mattress', 'Kitchen with hob & full cookware', 'Smart storage throughout', 'Solar power & USB charging'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleBookNow}
                className="mt-8 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl transition-all hover:opacity-90 flex items-center gap-2"
              >
                Book Your Van <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── UNIQUE HOOK: TRAVEL GUIDE ─────────────────────────────────────── */}
      <section className="py-24 px-4 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={springPresets.gentle}
            >
              <span className="inline-block px-3 py-1 bg-destructive/10 text-destructive text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                🎁 Exclusive Bonus
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-5 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                The Albania Vanlife Travel Guide — Included Free
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                This isn't a list of tourist traps. This is the guide we wish we had when we first explored Albania.
                Weeks of research, condensed into one essential resource.
              </p>
              <div className="space-y-4">
                {[
                  { icon: '📍', title: 'Hidden Spots', desc: 'Secret beaches, viewpoints, and places no guidebook mentions.' },
                  { icon: '🗺️', title: 'Exact Routes', desc: 'Day-by-day driving routes optimized for vanlife. No guesswork.' },
                  { icon: '🌙', title: 'Sleeping Locations', desc: 'Curated overnight spots — clifftops, forests, beaches. All verified.' },
                  { icon: '🍽️', title: 'Local Tips', desc: 'Best local restaurants, fuel stations, water points and wifi spots.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-foreground">{item.title}</div>
                      <div className="text-muted-foreground text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                <p className="text-sm font-semibold text-primary">
                  💡 "Saves you weeks of planning. This guide alone is worth the trip."
                </p>
              </div>
              <button
                onClick={handleBookNow}
                className="mt-6 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl transition-all hover:opacity-90 flex items-center gap-2"
              >
                Get the Full Experience <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={springPresets.gentle}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src={COAST_IMG} alt="Albania coast" className="w-full h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground">📘</div>
                    <div>
                      <div className="font-bold text-white">Albania Vanlife Guide</div>
                      <div className="text-white/70 text-xs">Exclusive · Included with every booking</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['50+ Hidden Spots', '7-Day Route', '30+ Sleep Spots', 'Local Tips'].map(t => (
                      <div key={t} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs font-medium">
                        ✓ {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ──────────────────────────────────────────────── */}
      <section id="included" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            label="Everything Included"
            title="One Price. Zero Surprises."
            subtitle="Everything you need for the perfect vanlife trip in Albania is already in the van."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {INCLUDED_ITEMS.map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                className="p-6 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-md transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 text-center">
            <button
              onClick={handleBookNow}
              className="px-10 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl transition-all hover:opacity-90"
              style={{ boxShadow: '0 4px 20px color-mix(in srgb, var(--primary) 35%, transparent)' }}
            >
              Book Now – $130/Night
            </button>
            <p className="mt-3 text-sm text-destructive font-medium">🔥 Only a few dates left this season</p>
          </div>
        </div>
      </section>

      {/* ── BOOKING SECTION ───────────────────────────────────────────────── */}
      <section id="booking" className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            label="Book Your Van"
            title="Check Availability & Book"
            subtitle="Select your dates and get an instant price. High demand during summer — secure your trip today."
          />

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Booking card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={springPresets.gentle}
              className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xl"
            >
              {/* Price header */}
              <div className="flex items-baseline gap-2 mb-6">
                <span
                  className="text-4xl font-bold text-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  $130
                </span>
                <span className="text-muted-foreground text-lg">/ night</span>
                <span className="ml-auto flex items-center gap-1 text-sm">
                  <Stars count={5} />
                </span>
              </div>

              <BookingCalendar />

              {/* Urgency */}
              <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                <span className="text-destructive">🔥</span>
                <p className="text-xs font-semibold text-destructive">
                  High demand this summer — only a few dates remain. Book early.
                </p>
              </div>
            </motion.div>

            {/* Info panels */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springPresets.gentle, delay: 0.15 }}
              className="space-y-5"
            >
              {/* Why book now */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Why Book Early?
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: '📅', text: 'Summer slots fill up fast — especially July & August' },
                    { icon: '💰', text: 'No cancellation fee if plans change (14+ days notice)' },
                    { icon: '🗺️', text: 'Travel guide sent immediately after booking' },
                    { icon: '🤝', text: 'Personal support from day one of planning' },
                  ].map(item => (
                    <div key={item.text} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Simple Pricing
                </h3>
                <div className="space-y-3">
                  {[
                    { label: '1–3 nights', price: '$130/night' },
                    { label: '4–7 nights', price: '$130/night' },
                    { label: '7+ nights', price: 'Contact us' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground text-sm">{row.label}</span>
                      <span className="font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {row.price}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Everything included. No fuel surcharge, no cleaning fee surprise.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="font-bold text-foreground">Got Questions?</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Message us on WhatsApp and we'll respond within minutes.
                </p>
                <a
                  href="https://wa.me/355000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-semibold rounded-xl text-sm hover:bg-green-600 transition-colors"
                >
                  <span>💬</span> Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeading
            label="Simple Process"
            title="How It Works"
            subtitle="Three steps from here to the open road."
          />

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...springPresets.gentle, delay: i * 0.12 }}
                className="text-center group"
              >
                <div
                  className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary group-hover:border-primary transition-all duration-300"
                >
                  <span
                    className="text-2xl font-bold text-primary group-hover:text-primary-foreground transition-colors"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => scrollToSection('booking')}
              className="px-10 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl transition-all hover:opacity-90 flex items-center gap-2 mx-auto"
              style={{ boxShadow: '0 4px 20px color-mix(in srgb, var(--primary) 35%, transparent)' }}
            >
              Check Availability <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-24 px-4 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            label="Traveler Reviews"
            title="Loved by Travelers Across Europe"
            subtitle="Don't just take our word for it."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {REVIEWS.map((review) => (
              <motion.div
                key={review.name}
                variants={staggerItem}
                className="bg-background border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <Stars count={review.rating} />
                  <span className="text-2xl">{review.flag}</span>
                </div>
                <p className="text-foreground leading-relaxed text-sm flex-1">
                  "{review.text}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <div className="font-semibold text-foreground text-sm">{review.name}</div>
                    <div className="text-xs text-muted-foreground">{review.country}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{review.date}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Aggregate rating */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-background border border-border rounded-2xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>4.98</div>
                <Stars count={5} />
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <div className="font-bold text-foreground">100+ happy travelers</div>
                <div className="text-sm text-muted-foreground">All from across Europe</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionHeading
            label="FAQ"
            title="Your Questions Answered"
            subtitle="Everything you need to know before booking."
          />
          <FaqAccordion />
          <div className="mt-10 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <a
              href="https://wa.me/355000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
            >
              <span>💬</span> Ask us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Albania mountains" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={springPresets.gentle}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/20 border border-primary/30 text-primary text-xs font-semibold rounded-full uppercase tracking-widest mb-6">
              🚐 Your adventure starts here
            </span>
            <h2
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ready for the Roadtrip<br />of a Lifetime?
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Albania is waiting. The van is ready.<br />
              <span className="text-primary font-semibold">All you have to do is pick the dates.</span>
            </p>
            <button
              onClick={handleBookNow}
              className="px-12 py-5 bg-primary text-primary-foreground font-bold text-xl rounded-2xl transition-all hover:opacity-90 active:scale-[0.97] shadow-2xl"
              style={{ boxShadow: '0 8px 40px color-mix(in srgb, var(--primary) 50%, transparent)' }}
            >
              BOOK NOW →
            </button>
            <p className="mt-5 text-white/50 text-sm flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-destructive" />
              <span className="text-destructive font-semibold">Limited availability this season.</span>
              Dates go fast.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🚐</span>
                <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Vanlife<span className="text-primary"> Albania</span>
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The easiest way to experience vanlife in Albania. Fully equipped campervan + exclusive travel guide included.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
              <div className="space-y-2">
                {[
                  { label: 'The Experience', id: 'experience' },
                  { label: "What's Included", id: 'included' },
                  { label: 'Book Now', id: 'booking' },
                  { label: 'Reviews', id: 'reviews' },
                  { label: 'FAQ', id: 'faq' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => scrollToSection(l.id)}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📍 Pickup in Tirana, Albania</p>
                <p>💬 WhatsApp: Available 7 days</p>
                <p>📧 hello@vanlifealbania.com</p>
              </div>
              <div className="mt-4 flex gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-muted rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary">
                  📸
                </a>
                <a href="https://wa.me/355000000000" target="_blank" rel="noopener noreferrer"
                  className="p-2 bg-muted rounded-lg hover:bg-green-500/10 transition-colors text-muted-foreground hover:text-green-600">
                  💬
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 Vanlife in Albania. All rights reserved.</p>
            <p>Made with ❤️ for adventurous travelers</p>
          </div>
        </div>
      </footer>

      {/* Bottom padding for mobile sticky bar */}
      <div className="md:hidden h-20" />
    </div>
  );
}
