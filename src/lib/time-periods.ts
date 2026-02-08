export interface Persona {
  name: string
  role: string
  age: number
  gender: 'male' | 'female'
  origin: string // language/accent hint for TTS voice selection
  details: string
  portrait?: string // path under /portraits/
}

export interface EffectCard {
  cause: string
  effect: string
  emoji: string
}

export interface TimePeriod {
  id: string
  era: string
  year: number
  yearLabel: string
  location: string
  color: string
  description: string
  personas: Persona[]
  effects: EffectCard[]
}

export const TIME_PERIODS: TimePeriod[] = [
  {
    id: 'ancient-egypt',
    era: 'Ancient Egypt',
    year: -1500,
    yearLabel: '1500 BCE',
    location: 'Thebes, Egypt',
    color: '#D4A843',
    description: 'The New Kingdom is at its height. Pharaohs build massive temples and trade routes stretch across the known world.',
    personas: [
      { name: 'Nefertari', role: 'scribe apprentice', age: 13, gender: 'female', origin: 'en-GB', details: 'Learning hieroglyphics at the Temple of Karnak. One of the few girls allowed to study writing.', portrait: '/portraits/ancient-egypt-nefertari.png' },
      { name: 'Khufu', role: 'fisherman\'s son', age: 11, gender: 'male', origin: 'en-GB', details: 'Lives along the Nile. Helps his father catch tilapia and perch. Dreams of joining the pharaoh\'s army.', portrait: '/portraits/ancient-egypt-khufu.png' },
    ],
    effects: [
      { cause: 'Egyptians invented papyrus for writing', effect: 'We have paper, books, and notebooks today', emoji: '📜' },
      { cause: 'They built irrigation canals from the Nile', effect: 'Modern farming uses irrigation systems worldwide', emoji: '🌾' },
    ],
  },
  {
    id: 'han-dynasty',
    era: 'Han Dynasty China',
    year: 100,
    yearLabel: '100 CE',
    location: 'Chang\'an (Xi\'an), China',
    color: '#C41E3A',
    description: 'The Silk Road connects China to Rome. Paper has just been invented, and the empire is booming with new ideas.',
    personas: [
      { name: 'Mei Lin', role: 'silk weaver\'s daughter', age: 12, gender: 'female', origin: 'zh', details: 'Helps her mother weave silk cloth that traders carry all the way to Rome. Fascinated by the merchants\' stories of faraway lands.', portrait: '/portraits/han-dynasty-mei-lin.png' },
      { name: 'Zhang Wei', role: 'papermaker\'s apprentice', age: 14, gender: 'male', origin: 'zh', details: 'Works in one of the first paper workshops. Experiments with different plant fibers to make better paper.', portrait: '/portraits/han-dynasty-zhang-wei.png' },
    ],
    effects: [
      { cause: 'The Silk Road connected East and West', effect: 'Global trade and cultural exchange exist today', emoji: '🐫' },
      { cause: 'Chinese inventors created paper from plant fibers', effect: 'Paper is still everywhere — books, packaging, art', emoji: '📄' },
    ],
  },
  {
    id: 'medieval-west-africa',
    era: 'Medieval West Africa',
    year: 1325,
    yearLabel: '1325 CE',
    location: 'Timbuktu, Mali Empire',
    color: '#8B6914',
    description: 'Mansa Musa rules the richest empire on Earth. Timbuktu is a center of learning with one of the world\'s great libraries.',
    personas: [
      { name: 'Aminata', role: 'student at Sankore University', age: 13, gender: 'female', origin: 'en-GB', details: 'Studies mathematics and astronomy at one of the oldest universities in the world. Her family trades gold and salt.', portrait: '/portraits/medieval-west-africa-aminata.png' },
      { name: 'Kofi', role: 'goldsmith\'s apprentice', age: 12, gender: 'male', origin: 'en-GB', details: 'Learning to craft gold jewelry and coins. The Mali Empire controls most of the world\'s gold supply.', portrait: '/portraits/medieval-west-africa-kofi.png' },
    ],
    effects: [
      { cause: 'Timbuktu\'s libraries preserved knowledge from many cultures', effect: 'Universities and public libraries exist everywhere today', emoji: '📚' },
      { cause: 'West African gold trade shaped the global economy', effect: 'Gold is still used as money and in electronics', emoji: '✨' },
    ],
  },
  {
    id: 'renaissance-italy',
    era: 'Renaissance Italy',
    year: 1505,
    yearLabel: '1505 CE',
    location: 'Florence, Italy',
    color: '#6B4226',
    description: 'Art and science are exploding. Leonardo da Vinci is painting, Gutenberg\'s printing press is spreading ideas faster than ever.',
    personas: [
      { name: 'Isabella', role: 'painter\'s apprentice', age: 14, gender: 'female', origin: 'it', details: 'Works in a busy art studio grinding pigments and learning to paint. Has secretly been studying anatomy from Leonardo\'s sketches.', portrait: '/portraits/renaissance-italy-isabella.png' },
      { name: 'Marco', role: 'printer\'s assistant', age: 11, gender: 'male', origin: 'it', details: 'Helps operate one of Florence\'s new printing presses. Amazed that a book that took monks a year to copy can now be printed in days.', portrait: '/portraits/renaissance-italy-marco.png' },
    ],
    effects: [
      { cause: 'The printing press made books affordable for everyone', effect: 'Anyone can publish ideas online instantly today', emoji: '🖨️' },
      { cause: 'Artists studied human anatomy and perspective', effect: 'We have realistic movies, video games, and 3D art', emoji: '🎨' },
    ],
  },
  {
    id: 'industrial-england',
    era: 'Industrial Revolution',
    year: 1845,
    yearLabel: '1845 CE',
    location: 'Manchester, England',
    color: '#4A4A4A',
    description: 'Factories and railways are transforming the world. Steam power is changing everything, but the work is hard and the cities are crowded.',
    personas: [
      { name: 'Thomas', role: 'railway engineer\'s son', age: 13, gender: 'male', origin: 'en-GB', details: 'His father helps build the railways connecting cities. Thomas rides the train to school — something his grandparents never imagined.', portrait: '/portraits/industrial-england-thomas.png' },
      { name: 'Ada', role: 'factory worker turned student', age: 14, gender: 'female', origin: 'en-GB', details: 'Used to work in a textile mill but now attends a new public school. Loves mathematics and dreams of building machines.', portrait: '/portraits/industrial-england-ada.png' },
    ],
    effects: [
      { cause: 'Steam engines powered factories and trains', effect: 'We have cars, planes, and electric motors everywhere', emoji: '🚂' },
      { cause: 'People demanded better working conditions', effect: 'We have labor laws, weekends, and child labor protections', emoji: '⚖️' },
    ],
  },
  {
    id: 'space-age',
    era: 'Space Age',
    year: 1969,
    yearLabel: '1969 CE',
    location: 'Houston, Texas, USA',
    color: '#1B3A5C',
    description: 'Humans just walked on the Moon. Computers fill entire rooms, and the future feels like anything is possible.',
    personas: [
      { name: 'Diana', role: 'NASA engineer\'s daughter', age: 12, gender: 'female', origin: 'en-US', details: 'Her mom is one of the few women working at Mission Control. Diana watches rocket launches from the roof of their house.', portrait: '/portraits/space-age-diana.png' },
      { name: 'James', role: 'kid who watched the Moon landing on TV', age: 10, gender: 'male', origin: 'en-US', details: 'His whole neighborhood gathered around one TV to watch Neil Armstrong\'s first step. Now he builds model rockets in his backyard.', portrait: '/portraits/space-age-james.png' },
    ],
    effects: [
      { cause: 'NASA needed tiny computers for spacecraft', effect: 'You carry a supercomputer (your phone) in your pocket', emoji: '📱' },
      { cause: 'Satellites were launched into orbit', effect: 'We have GPS, weather forecasts, and video calls', emoji: '🛰️' },
    ],
  },
]

export function getRandomPeriod(excludeId?: string): TimePeriod {
  const available = excludeId
    ? TIME_PERIODS.filter(p => p.id !== excludeId)
    : TIME_PERIODS
  return available[Math.floor(Math.random() * available.length)]
}

export function getRandomPersona(period: TimePeriod): Persona {
  return period.personas[Math.floor(Math.random() * period.personas.length)]
}
