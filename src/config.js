// Challenge constants (Brief; D-005, D-006, D-012, D-023). Public values only — no secrets.
export const START = '2026-11-09';
export const END = '2026-12-23';
export const GOAL = 30;
export const TOTAL_DAYS = 45;
export const TIME_ZONE = 'America/Toronto';
export const MIN_MINUTES = { ymca: 30, home: 45 };
export const INACTIVITY_MS = 48 * 3600 * 1000; // D-022

export const TYPES = [
  { id: 'gravity',   name: 'Gravity',        where: 'ymca', tone: 'coral' },
  { id: 'totaltone', name: 'TotalTone',      where: 'ymca', tone: 'teal' },
  { id: 'core',      name: 'Core & Stretch', where: 'ymca', tone: 'coral' },
  { id: 'kettle',    name: 'Kettlebell',     where: 'ymca', tone: 'teal' },
  { id: 'yoga',      name: 'Yoga class',     where: 'ymca', tone: 'teal' },
  { id: 'gym',       name: 'Gym time',       where: 'ymca', tone: 'coral' },
  { id: 'homeyoga',  name: 'Home yoga',      where: 'home', tone: 'teal' },
  { id: 'other',     name: 'Other',          where: null,   tone: 'coral' },
];

// Supabase public settings (anon/publishable key is public by design; RLS enforces writes).
export const SUPABASE_URL = 'https://xuabtbdhpdlsrljjjdyc.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_sNZ2-8u1nVXJNOdS5SNPOQ_-ULQuSiL'; // publishable — safe in the browser

export const QUOTES = [
  "Take care of your body. It's the only place you have to live.",
  "Every workout is a gift to your future self.",
  "Strong body, clear mind, good day.",
  "Movement is medicine, and today's dose is waiting.",
  "You get a little stronger with every class.",
  "Healthy is a habit you build one day at a time.",
  "Exercise is a celebration of what your body can do.",
  "Energy grows when you use it.",
  "Every step forward counts.",
  "Your body can do amazing things. Let it show you today.",
  "Feeling good starts with moving.",
  "Small steps every day add up to big changes.",
  "A healthy body is a happy home.",
  "Sweat is just your body cheering you on.",
  "Fitness isn't a destination. It's a way of living.",
  "The more you move, the better you feel.",
  "You're building a stronger, healthier you.",
  "Make your health a priority today.",
  "Good things happen when you show up for yourself.",
  "Your heart loves it when you move.",
  "Every rep counts, and so do you.",
  "Invest in your health. It pays you back every day.",
  "Be a little stronger than yesterday.",
  "Progress, not perfection.",
  "Today is a great day to feel strong.",
  "Healthy habits make happy days.",
  "Your future self is cheering for you.",
  "Move with joy.",
  "Strength is built, one workout at a time.",
  "You're becoming your healthiest self, one day at a time.",
  "Determination turns \"I'll try\" into \"I did.\"",
  "Keep going. Determination takes you further than talent ever will.",
  "You don't have to be the fastest. You just have to keep going.",
  "A determined mind can carry a tired body a long way.",
  "The finish line is built from the days you didn't give up.",
  "It always seems impossible until it's done.",
  "Grit is showing up again, and again, and again.",
  "Your determination is stronger than any excuse.",
  "Far is just a lot of near, one workout at a time.",
  "Stay determined. Thirty is closer every time you show up."
];
