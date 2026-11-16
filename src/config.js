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

// Daily quotes from athletes and coaches (D-033). Attributions are the widely cited ones.
export const QUOTES = [
  { text: "I've missed more than 9,000 shots in my career. I've lost almost 300 games. 26 times I've been trusted to take the game-winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed.", by: "Michael Jordan" },
  { text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", by: "Muhammad Ali" },
  { text: "I don't count my sit-ups. I only start counting when it starts hurting, because they're the only ones that count.", by: "Muhammad Ali" },
  { text: "I really think a champion is defined not by their wins but by how they can recover when they fall.", by: "Serena Williams" },
  { text: "You have to expect things of yourself before you can do them.", by: "Michael Jordan" },
  { text: "Never say never, because limits, like fears, are often just an illusion.", by: "Michael Jordan" },
  { text: "I am building a fire, and every day I train, I add more fuel.", by: "Mia Hamm" },
  { text: "Hard days are the best because that's when champions are made.", by: "Gabby Douglas" },
  { text: "Age is no barrier. It's a limitation you put on your mind.", by: "Jackie Joyner-Kersee" },
  { text: "Champions keep playing until they get it right.", by: "Billie Jean King" },
  { text: "You can't put a limit on anything. The more you dream, the farther you get.", by: "Michael Phelps" },
  { text: "Gold medals aren't really made of gold. They're made of sweat, determination, and a hard-to-find alloy called guts.", by: "Dan Gable" },
  { text: "It's not whether you get knocked down, it's whether you get up.", by: "Vince Lombardi" },
  { text: "Once you learn to quit, it becomes a habit.", by: "Vince Lombardi" },
  { text: "The more difficult the victory, the greater the happiness in winning.", by: "Pelé" },
  { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.", by: "Pelé" },
  { text: "You miss 100% of the shots you don't take.", by: "Wayne Gretzky" },
  { text: "Run when you can, walk if you have to, crawl if you must; just never give up.", by: "Dean Karnazes" },
  { text: "The miracle isn't that I finished. The miracle is that I had the courage to start.", by: "John Bingham" },
  { text: "It is not the mountain we conquer, but ourselves.", by: "Sir Edmund Hillary" },
  { text: "Strength does not come from winning. Your struggles develop your strengths.", by: "Arnold Schwarzenegger" },
  { text: "There may be people that have more talent than you, but there's no excuse for anyone to work harder than you do.", by: "Derek Jeter" },
  { text: "If you can't outplay them, outwork them.", by: "Ben Hogan" },
  { text: "A champion is someone who gets up when they can't.", by: "Jack Dempsey" },
  { text: "Do not let what you cannot do interfere with what you can do.", by: "John Wooden" },
  { text: "The difference between the impossible and the possible lies in a person's determination.", by: "Tommy Lasorda" },
  { text: "Don't stop when you're tired. Stop when you're done.", by: "David Goggins" },
  { text: "I'd rather regret the risks that didn't work out than the chances I didn't take at all.", by: "Simone Biles" },
  { text: "I trained four years to run nine seconds, and people give up when they don't see results in two months.", by: "Usain Bolt" },
  { text: "Everything negative, pressure, challenges, is all an opportunity for me to rise.", by: "Kobe Bryant" },
  { text: "The potential for greatness lives within each of us.", by: "Wilma Rudolph" },
  { text: "To give anything less than your best is to sacrifice the gift.", by: "Steve Prefontaine" },
  { text: "The man who can drive himself further once the effort gets painful is the man who will win.", by: "Roger Bannister" },
  { text: "No human is limited.", by: "Eliud Kipchoge" },
  { text: "You have to believe in yourself when no one else does.", by: "Venus Williams" },
  { text: "Start where you are. Use what you have. Do what you can.", by: "Arthur Ashe" },
  { text: "Excellence is the gradual result of always striving to do better.", by: "Pat Riley" },
  { text: "When anyone tells me I can't do anything, I'm just not listening any more.", by: "Florence Griffith Joyner" },
  { text: "Ability is what you're capable of doing. Motivation determines what you do. Attitude determines how well you do it.", by: "Lou Holtz" },
  { text: "Somewhere behind the athlete you've become and the hours of practice and the coaches who have pushed you is a little girl who fell in love with the game and never looked back. Play for her.", by: "Mia Hamm" }
];
