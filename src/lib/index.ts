// ─── Route Paths ───────────────────────────────────────────────────────────────
export const ROUTE_PATHS = {
  HOME: '/',
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Review {
  name: string;
  country: string;
  flag: string;
  rating: number;
  text: string;
  date: string;
}

export interface IncludedItem {
  icon: string;
  title: string;
  desc: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Step {
  number: string;
  title: string;
  desc: string;
}

// ─── Data ──────────────────────────────────────────────────────────────────────
export const PRICE_PER_NIGHT = 130;

export const REVIEWS: Review[] = [
  {
    name: 'Sophie M.',
    country: 'Germany',
    flag: '🇩🇪',
    rating: 5,
    text: 'Absolutely the best way to see Albania. Woke up every morning to a view that took my breath away. The travel guide was gold — we found spots we never would have discovered on our own.',
    date: 'August 2024',
  },
  {
    name: 'Luca & Elena',
    country: 'Italy',
    flag: '🇮🇹',
    rating: 5,
    text: 'Total freedom, total adventure. The van was spotless and super comfortable. The guide saved us weeks of planning and led us to the most hidden gems. 10/10 would book again.',
    date: 'September 2024',
  },
  {
    name: 'James K.',
    country: 'United Kingdom',
    flag: '🇬🇧',
    rating: 5,
    text: "Felt like total freedom. Albania exceeded every expectation and the van made it all effortless. Sleeping by the Ionian Sea with zero other tourists around — that's something you can't buy at a hotel.",
    date: 'July 2024',
  },
  {
    name: 'Marta W.',
    country: 'Netherlands',
    flag: '🇳🇱',
    rating: 5,
    text: "The guide made everything so easy. Hidden beaches, mountain roads, local restaurants — all mapped out for us. The van was cozy, well-equipped and everything worked perfectly.",
    date: 'June 2024',
  },
  {
    name: 'Carlos & Ana',
    country: 'Spain',
    flag: '🇪🇸',
    rating: 5,
    text: "Best way to see Albania. We covered the entire coast and the mountains in 10 days. The support team was incredibly helpful whenever we had questions. This is how travel should be.",
    date: 'October 2024',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What driving license do I need?',
    a: 'A standard EU/international driving license is sufficient. Albania is accessible for most European drivers, and our van is easy to drive — a regular B-category license covers it all.',
  },
  {
    q: 'Where is the pickup location?',
    a: 'Pickup is in Tirana, the capital of Albania. It\'s easily reachable by direct flights from major European cities. We\'ll provide the exact address and meet you personally.',
  },
  {
    q: 'Is Albania safe to travel?',
    a: 'Absolutely. Albania is one of the most welcoming and safe countries in Europe. Locals are incredibly hospitable to tourists, and crime rates are very low. Vanlife travelers consistently rate it as one of their safest destinations.',
  },
  {
    q: 'What\'s included in the rental?',
    a: 'Everything you need: a fully equipped van with a comfortable bed, kitchen with cooking gear, storage, bedding, solar power, and our exclusive Albania Vanlife Travel Guide with hidden spots, routes, and local tips.',
  },
  {
    q: 'Where can we sleep?',
    a: 'Albania has incredible freedom camping opportunities. Our travel guide includes curated sleeping spots — from clifftop locations overlooking the Ionian Sea to mountain meadows and riverside spots. Wild camping is generally accepted and the views are unmatched.',
  },
  {
    q: 'Is there a minimum rental period?',
    a: 'We recommend a minimum of 3 nights to truly experience what Albania has to offer, but we\'re flexible. Contact us and we\'ll find a solution that works for your schedule.',
  },
];

export const HOW_IT_WORKS: Step[] = [
  {
    number: '01',
    title: 'Choose Your Dates',
    desc: 'Pick your start and end dates using our live calendar. Instant price calculation — no surprises.',
  },
  {
    number: '02',
    title: 'Pick Up in Albania',
    desc: 'Meet us in Tirana. We\'ll walk you through everything, hand over the keys and your exclusive travel guide.',
  },
  {
    number: '03',
    title: 'Start Your Adventure',
    desc: 'Drive wherever the road takes you. Wake up by the sea, explore the mountains, discover hidden Albania.',
  },
];

export const INCLUDED_ITEMS: IncludedItem[] = [
  { icon: '🛏️', title: 'Comfortable Bed', desc: 'Full-size bed with quality mattress and bedding. Sleep anywhere in total comfort.' },
  { icon: '🍳', title: 'Full Kitchen', desc: 'Hob, cookware, utensils and all the tools to prepare real meals on the road.' },
  { icon: '🗺️', title: 'Exclusive Travel Guide', desc: 'Hidden spots, exact routes, sleeping locations, local restaurants. Saves weeks of planning.' },
  { icon: '🔋', title: 'Solar Power', desc: 'Solar panel setup keeps your devices charged and powers onboard appliances.' },
  { icon: '📦', title: 'Ample Storage', desc: 'Smart storage throughout the van so you can pack everything you need without clutter.' },
  { icon: '🤝', title: '24/7 Support', desc: 'We\'re always just a message away. Real support from people who know Albania.' },
];

// ─── Utils ─────────────────────────────────────────────────────────────────────
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export function formatPrice(nights: number): string {
  return (nights * PRICE_PER_NIGHT).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}
