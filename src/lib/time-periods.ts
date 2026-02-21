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
  coordinates: [number, number] // [lng, lat]
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
    coordinates: [32.61, 25.70],
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
    coordinates: [108.94, 34.26],
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
    id: 'norse-greenland',
    era: 'Norse Greenland Settlements',
    year: 1000,
    yearLabel: '1000 CE',
    location: 'Eastern Settlement, Greenland',
    coordinates: [-45.40, 61.00],
    color: '#5B7C8D',
    description: 'Norse settlers establish farms along Greenland\'s fjords, raising livestock and trading walrus ivory across the North Atlantic.',
    personas: [
      { name: 'Astrid', role: 'farmer\'s daughter', age: 12, gender: 'female', origin: 'en-GB', details: 'Helps manage sheep and goats during short summers and preserve food for long winters.', portrait: '/portraits/norse-greenland-astrid.png' },
      { name: 'Leif', role: 'boat repair apprentice', age: 13, gender: 'male', origin: 'en-GB', details: 'Learns to patch hulls and rigging for voyages to Iceland and Norway.', portrait: '/portraits/norse-greenland-leif.png' },
    ],
    effects: [
      { cause: 'Settlers adapted farming and trade to Arctic conditions', effect: 'Cold-climate engineering and food storage are still essential in northern regions', emoji: '❄️' },
      { cause: 'North Atlantic sea routes linked distant communities', effect: 'Maritime routes continue to connect remote regions to global markets', emoji: '🛶' },
    ],
  },
  {
    id: 'hedeby-trade-hub',
    era: 'Viking Age Trade Networks',
    year: 870,
    yearLabel: '870 CE',
    location: 'Hedeby, Denmark',
    coordinates: [9.42, 54.52],
    color: '#4F6D5A',
    description: 'Hedeby is a major Viking trading port where merchants bargain over silk, furs, glass, and metalwork across languages and cultures.',
    personas: [
      { name: 'Rask', role: 'merchant\'s son', age: 11, gender: 'male', origin: 'en-GB', details: 'Keeps tally sticks at the dock, haggles with travelers, and jokes that most people who fear Vikings have never met a trader.', portrait: '/portraits/hedeby-trade-hub-rask.png' },
      { name: 'Sigrid', role: 'ledger apprentice', age: 13, gender: 'female', origin: 'en-GB', details: 'Learns weights, measures, and loan records from her mother, who manages contracts for incoming ships.', portrait: '/portraits/hedeby-trade-hub-sigrid.png' },
    ],
    effects: [
      { cause: 'Viking ports linked northern Europe to long-distance trade routes', effect: 'Global commerce still depends on multicultural port cities and logistics hubs', emoji: '⚓' },
      { cause: 'Merchant families used practical multilingual skills for bargaining', effect: 'Language learning remains a core advantage in international business', emoji: '🗣️' },
    ],
  },
  {
    id: 'medieval-west-africa',
    era: 'Medieval West Africa',
    year: 1325,
    yearLabel: '1325 CE',
    location: 'Timbuktu, Mali Empire',
    coordinates: [-3.01, 16.77],
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
    id: 'timbuktu-gold-shock',
    era: 'Mali Empire Gold Shock',
    year: 1324,
    yearLabel: '1324 CE',
    location: 'Timbuktu, Mali Empire',
    coordinates: [-3.01, 16.77],
    color: '#A57C1B',
    description: 'As news of Mansa Musa\'s pilgrimage spreads, people debate gold\'s value and watch trade terms shift in unpredictable ways.',
    personas: [
      { name: 'Amina', role: 'market helper', age: 9, gender: 'female', origin: 'en-GB', details: 'Carries small scales for her aunt and hears adults argue that too much gold has made ordinary exchange harder.', portrait: '/portraits/timbuktu-gold-shock-amina.png' },
      { name: 'Bakary', role: 'caravan clerk\'s nephew', age: 12, gender: 'male', origin: 'en-GB', details: 'Copies prices for salt, cloth, and copper while merchants recalculate what a fair trade means this month.', portrait: '/portraits/timbuktu-gold-shock-bakary.png' },
    ],
    effects: [
      { cause: 'Large gold flows disrupted local and regional price systems', effect: 'Modern economies still face inflation shocks when money supply or supply chains change quickly', emoji: '📉' },
      { cause: 'Market participants adapted by shifting goods, contracts, and trust networks', effect: 'Financial resilience today still depends on flexible institutions and local trust', emoji: '🧮' },
    ],
  },
  {
    id: 'great-zimbabwe',
    era: 'Kingdom of Great Zimbabwe',
    year: 1450,
    yearLabel: '1450 CE',
    location: 'Great Zimbabwe, Zimbabwe',
    coordinates: [30.93, -20.27],
    color: '#7A5A3A',
    description: 'Stone cities, regional trade, and skilled crafts define life at Great Zimbabwe. Merchants connect inland communities to ports on the Indian Ocean.',
    personas: [
      { name: 'Nyasha', role: 'stone mason\'s apprentice', age: 13, gender: 'female', origin: 'en-GB', details: 'Learns to shape granite blocks for walls built without mortar. She helps her family maintain homes and gathering spaces.', portrait: '/portraits/great-zimbabwe-nyasha.png' },
      { name: 'Tawanda', role: 'cattle keeper and trader\'s son', age: 12, gender: 'male', origin: 'en-GB', details: 'Helps move cattle between grazing lands and carries goods for traders exchanging gold, ivory, and cloth.', portrait: '/portraits/great-zimbabwe-tawanda.png' },
    ],
    effects: [
      { cause: 'Communities built durable stone architecture and organized cities', effect: 'Urban planning and public building projects still shape modern life', emoji: '🧱' },
      { cause: 'Trade routes connected southern Africa to global markets', effect: 'International trade networks remain central to world economies', emoji: '🌍' },
    ],
  },
  {
    id: 'songhai-empire',
    era: 'Songhai Empire',
    year: 1490,
    yearLabel: '1490 CE',
    location: 'Gao, Songhai Empire (Mali/Niger)',
    coordinates: [-0.04, 16.27],
    color: '#9A6B2F',
    description: 'Songhai becomes one of the largest empires in African history, controlling major Saharan trade routes and centers of scholarship.',
    personas: [
      { name: 'Hawa', role: 'market recorder', age: 14, gender: 'female', origin: 'en-GB', details: 'Helps track caravan goods entering Gao, including salt, textiles, and books from North Africa.', portrait: '/portraits/songhai-empire-hawa.png' },
      { name: 'Idrissa', role: 'riverboat apprentice', age: 12, gender: 'male', origin: 'en-GB', details: 'Learns to transport grain and merchants along the Niger River, linking farms to city markets.', portrait: '/portraits/songhai-empire-idrissa.png' },
    ],
    effects: [
      { cause: 'Songhai linked trans-Saharan and river trade systems', effect: 'Modern economies still depend on integrated transport and trade corridors', emoji: '🛶' },
      { cause: 'Scholarly cities preserved and expanded scientific learning', effect: 'Regional universities continue to shape innovation and public life', emoji: '🎓' },
    ],
  },
  {
    id: 'kingdom-of-kongo',
    era: 'Kingdom of Kongo',
    year: 1520,
    yearLabel: '1520 CE',
    location: 'Mbanza Kongo, Kingdom of Kongo (Angola/DRC)',
    coordinates: [14.25, -6.27],
    color: '#6E4B2A',
    description: 'The Kingdom of Kongo governs a large central African state with organized provinces, diplomacy, and long-distance trade.',
    personas: [
      { name: 'Mpemba', role: 'court messenger', age: 13, gender: 'female', origin: 'en-GB', details: 'Carries letters between provincial leaders and the royal court, learning protocol and political decision-making.', portrait: '/portraits/kingdom-of-kongo-mpemba.png' },
      { name: 'Lutete', role: 'blacksmith\'s apprentice', age: 12, gender: 'male', origin: 'en-GB', details: 'Helps forge tools and ceremonial objects traded between towns and farming communities.', portrait: '/portraits/kingdom-of-kongo-lutete.png' },
    ],
    effects: [
      { cause: 'Kongo developed centralized governance across many communities', effect: 'Modern states still rely on regional administration and shared legal frameworks', emoji: '🏛️' },
      { cause: 'Diplomatic exchange connected central Africa to global politics', effect: 'International diplomacy remains key to trade and conflict prevention', emoji: '🤝' },
    ],
  },
  {
    id: 'inca-empire',
    era: 'Inca Empire',
    year: 1480,
    yearLabel: '1480 CE',
    location: 'Cusco, Inca Empire (Peru)',
    coordinates: [-71.97, -13.52],
    color: '#B66A2A',
    description: 'The Inca govern a vast Andean empire linked by roads, terraces, and relay runners. Engineers adapt mountain landscapes to feed millions.',
    personas: [
      { name: 'Killa', role: 'textile maker\'s apprentice', age: 12, gender: 'female', origin: 'es', details: 'Learns to weave fine cloth used for clothing, ceremonies, and state gifts. Her family also tends terrace farms.', portrait: '/portraits/inca-empire-killa.png' },
      { name: 'Amaru', role: 'chaski messenger trainee', age: 13, gender: 'male', origin: 'es', details: 'Practices running between way stations, carrying messages and records across mountain roads.', portrait: '/portraits/inca-empire-amaru.png' },
      { name: 'Chaska', role: 'terrace water keeper', age: 12, gender: 'female', origin: 'es', details: 'Monitors stone channels feeding mountain terraces and reports leaks before dawn planting begins.', portrait: '/portraits/inca-empire-chaska.png' },
    ],
    effects: [
      { cause: 'The Inca built extensive roads and bridges across difficult terrain', effect: 'Modern transportation systems still rely on coordinated infrastructure networks', emoji: '🛤️' },
      { cause: 'Farmers developed high-altitude terraces and water management', effect: 'Terrace farming and soil conservation techniques are still used today', emoji: '⛰️' },
    ],
  },
  {
    id: 'tiwanaku-state',
    era: 'Tiwanaku Civilization',
    year: 900,
    yearLabel: '900 CE',
    location: 'Tiwanaku, Andes (Bolivia)',
    coordinates: [-68.67, -16.55],
    color: '#8C5E3C',
    description: 'Tiwanaku grows around Lake Titicaca with monumental architecture, raised-field agriculture, and regional influence across the Andes.',
    personas: [
      { name: 'Yana', role: 'field engineer\'s daughter', age: 12, gender: 'female', origin: 'es', details: 'Helps maintain raised planting beds that protect crops from frost and improve harvests.', portrait: '/portraits/tiwanaku-state-yana.png' },
      { name: 'Inti', role: 'stone carver trainee', age: 13, gender: 'male', origin: 'es', details: 'Learns precise stone shaping for temples and gateways used in civic and ceremonial life.', portrait: '/portraits/tiwanaku-state-inti.png' },
    ],
    effects: [
      { cause: 'Andean farmers engineered raised fields and water channels', effect: 'Climate-resilient agriculture today still uses landscape-based design', emoji: '🌱' },
      { cause: 'Large ceremonial centers coordinated surrounding communities', effect: 'Public gathering spaces remain important for civic identity', emoji: '🏟️' },
    ],
  },
  {
    id: 'muisca-confederation',
    era: 'Muisca Confederation',
    year: 1500,
    yearLabel: '1500 CE',
    location: 'Altiplano Cundiboyacense (Colombia)',
    coordinates: [-74.10, 4.65],
    color: '#A66D3A',
    description: 'Muisca communities organize powerful chiefdoms in the northern Andes, known for salt, goldwork, and mountain agriculture.',
    personas: [
      { name: 'Suamox', role: 'salt trader\'s apprentice', age: 12, gender: 'female', origin: 'es', details: 'Learns to process and exchange salt bricks, a key resource traded across highland routes.', portrait: '/portraits/muisca-confederation-suamox.png' },
      { name: 'Chiminigagua', role: 'gold artisan trainee', age: 13, gender: 'male', origin: 'es', details: 'Practices lost-wax casting techniques to create small ritual and ceremonial objects.', portrait: '/portraits/muisca-confederation-chiminigagua.png' },
    ],
    effects: [
      { cause: 'Muisca economies specialized in salt production and regional exchange', effect: 'Strategic resources still shape regional power and trade networks', emoji: '🧂' },
      { cause: 'Advanced metalworking supported cultural and ceremonial life', effect: 'Traditional craftsmanship continues to influence modern design and identity', emoji: '🛠️' },
    ],
  },
  {
    id: 'tenochtitlan-chinampas',
    era: 'Mexica Tenochtitlan',
    year: 1478,
    yearLabel: '1478 CE',
    location: 'Tenochtitlan, Lake Texcoco basin',
    coordinates: [-99.13, 19.43],
    color: '#2F7D6B',
    description: 'The lake city runs on canals, causeways, and chinampa agriculture, with produce and goods moving by canoe into crowded markets.',
    personas: [
      { name: 'Quauhtli', role: 'chinampa grower\'s child', age: 14, gender: 'male', origin: 'es', details: 'Paddles dawn harvests to market and measures small purchases in cacao beans, not metal coins.', portrait: '/portraits/tenochtitlan-chinampas-quauhtli.png' },
      { name: 'Xochitl', role: 'calpolli porter apprentice', age: 12, gender: 'female', origin: 'es', details: 'Carries reed baskets from canoe landings to stalls because there are no draft animals hauling city carts.', portrait: '/portraits/tenochtitlan-chinampas-xochitl.png' },
    ],
    effects: [
      { cause: 'Chinampa farming kept intensive food production close to the city', effect: 'Urban farming and short supply chains still improve food resilience', emoji: '🛶' },
      { cause: 'Water routes and human logistics powered city distribution systems', effect: 'Modern cities still depend on specialized transport networks to keep food flowing', emoji: '🥬' },
    ],
  },
  {
    id: 'yolngu-country',
    era: 'First Nations Australia',
    year: 1700,
    yearLabel: '1700 CE',
    location: 'Arnhem Land, Australia',
    coordinates: [134.50, -12.50],
    color: '#C17C3A',
    description: 'Yolngu communities care for Country through seasonal knowledge, trade, ceremony, and law. Songlines and kinship guide learning and responsibility.',
    personas: [
      { name: 'Marrkapmirr', role: 'young knowledge keeper', age: 12, gender: 'female', origin: 'en-AU', details: 'Learns songs, stories, and place-based knowledge from Elders, including when to fish, gather, and hold ceremonies.', portrait: '/portraits/yolngu-country-marrkapmirr.png' },
      { name: 'Djalu', role: 'canoe maker\'s nephew', age: 11, gender: 'male', origin: 'en-AU', details: 'Helps shape bark canoes and joins supervised fishing trips through mangroves and coastal waters.', portrait: '/portraits/yolngu-country-djalu.png' },
    ],
    effects: [
      { cause: 'First Nations communities maintained detailed ecological knowledge for thousands of years', effect: 'Land management today increasingly draws on Indigenous fire and seasonal practices', emoji: '🔥' },
      { cause: 'Oral traditions preserved law, navigation, and history across generations', effect: 'Community memory and storytelling remain vital forms of education', emoji: '🗣️' },
    ],
  },
  {
    id: 'polynesian-navigators',
    era: 'Polynesian Navigators',
    year: 1200,
    yearLabel: '1200 CE',
    location: 'Samoa and Tonga, Oceania',
    coordinates: [-172.10, -13.75],
    color: '#0F6C7A',
    description: 'Expert navigators cross the Pacific using stars, currents, winds, and wave patterns. Ocean voyaging links island communities across vast distances.',
    personas: [
      { name: 'Leilani', role: 'navigator\'s apprentice', age: 13, gender: 'female', origin: 'en-NZ', details: 'Studies star paths and wave reading at night, preparing for long canoe voyages between islands.', portrait: '/portraits/polynesian-navigators-leilani.png' },
      { name: 'Sione', role: 'canoe builder\'s son', age: 12, gender: 'male', origin: 'en-NZ', details: 'Learns how lashings, sails, and hull design help canoes stay stable in open-ocean travel.', portrait: '/portraits/polynesian-navigators-sione.png' },
    ],
    effects: [
      { cause: 'Polynesian wayfinding mapped the Pacific without modern instruments', effect: 'Navigation science today still studies stars, currents, and environmental cues', emoji: '🧭' },
      { cause: 'Inter-island exchange spread crops, technologies, and stories', effect: 'Maritime trade and cultural exchange continue to connect distant communities', emoji: '⛵' },
    ],
  },
  {
    id: 'renaissance-italy',
    era: 'Renaissance Italy',
    year: 1505,
    yearLabel: '1505 CE',
    location: 'Florence, Italy',
    coordinates: [11.25, 43.77],
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
    id: 'murano-glass-secrets',
    era: 'Venetian Glass Republic',
    year: 1570,
    yearLabel: '1570 CE',
    location: 'Murano, Venice',
    coordinates: [12.35, 45.45],
    color: '#A35C2A',
    description: 'Murano\'s furnaces produce world-famous glass while families guard techniques as protected trade knowledge under close oversight.',
    personas: [
      { name: 'Iacomo di Zuane', role: 'glassmaker\'s apprentice', age: 12, gender: 'male', origin: 'it', details: 'Sweeps ash, preheats tools, and memorizes furnace recipes in whispers because craft secrets are tightly controlled.', portrait: '/portraits/murano-glass-secrets-iacomo-di-zuane.png' },
      { name: 'Lucia', role: 'furnace tender\'s niece', age: 11, gender: 'female', origin: 'it', details: 'Measures days by furnace cycles and learns which visitors may watch the workshop and which must be turned away.', portrait: '/portraits/murano-glass-secrets-lucia.png' },
    ],
    effects: [
      { cause: 'Murano concentrated specialist manufacturing under legal restrictions', effect: 'Modern high-value industries still use export controls and trade-secret law', emoji: '🔥' },
      { cause: 'Craft knowledge passed through apprenticeships and family networks', effect: 'Hands-on vocational training remains essential for precision manufacturing', emoji: '🫙' },
    ],
  },
  {
    id: 'heian-kyoto',
    era: 'Heian Japan',
    year: 1000,
    yearLabel: '1000 CE',
    location: 'Heian-kyo (Kyoto), Japan',
    coordinates: [135.77, 35.01],
    color: '#9B5D73',
    description: 'Court life revolves around poetry, calligraphy, layered clothing, and ritual. Social status is shaped by elegance as much as power.',
    personas: [
      { name: 'Akiko', role: 'court attendant in training', age: 13, gender: 'female', origin: 'ja', details: 'Rises before dawn to grind ink, copy kana, and practice waka; one blot on scented paper can ruin a match.', portrait: '/portraits/heian-kyoto-akiko.png' },
      { name: 'Haru', role: 'page to a noble household', age: 12, gender: 'male', origin: 'ja', details: 'Carries folded notes between mansions, checking sleeve colors and rank markers so he does not shame his household.', portrait: '/portraits/heian-kyoto-haru.png' },
    ],
    effects: [
      { cause: 'Heian elites treated writing and aesthetics as core social skills', effect: 'Communication style still shapes reputation in schools, workplaces, and online spaces', emoji: '✍️' },
      { cause: 'Poetry was used for diplomacy and relationships', effect: 'Creative expression remains a powerful social language today', emoji: '📜' },
    ],
  },
  {
    id: 'cahokia-metropolis',
    era: 'Mississippian Cahokia',
    year: 1050,
    yearLabel: '1050 CE',
    location: 'Cahokia (near modern St. Louis), North America',
    coordinates: [-90.06, 38.66],
    color: '#8A6B3F',
    description: 'Cahokia grows into one of the largest cities north of Mesoamerica, with earthen mounds, trade networks, and public games.',
    personas: [
      { name: 'Tala', role: 'chunkey player in training', age: 12, gender: 'female', origin: 'en-US', details: 'Trains at first light for chunkey, sprinting after the rolling stone while elders and traders crowd the plaza.', portrait: '/portraits/cahokia-metropolis-tala.png' },
      { name: 'Nokosi', role: 'mound builder\'s nephew', age: 13, gender: 'male', origin: 'en-US', details: 'Hauls basket after basket up mound ramps and learns feast-day timings by drumbeat and sunrise.', portrait: '/portraits/cahokia-metropolis-nokosi.png' },
    ],
    effects: [
      { cause: 'Cahokia organized labor for massive civic construction', effect: 'Large public works still depend on coordinated planning and community effort', emoji: '🏗️' },
      { cause: 'Competitive games and rituals unified large populations', effect: 'Sports and festivals continue to create shared civic identity', emoji: '🥏' },
    ],
  },
  {
    id: 'edo-black-ships',
    era: 'Late Edo Japan',
    year: 1853,
    yearLabel: '1853 CE',
    location: 'Edo Bay (Tokyo Bay), Japan',
    coordinates: [139.80, 35.45],
    color: '#3C4F63',
    description: 'Commodore Perry\'s steam-powered "black ships" arrive, shocking a society that had enforced long isolation and triggering rapid political change.',
    personas: [
      { name: 'Ren', role: 'harbor clerk\'s apprentice', age: 14, gender: 'male', origin: 'ja', details: 'At the bay office, he copies hurried notices as the kurofune ("black ships") sit offshore breathing smoke.', portrait: '/portraits/edo-black-ships-ren.png' },
      { name: 'Aoi', role: 'fisher family daughter', age: 12, gender: 'female', origin: 'ja', details: 'Mends nets on the shore, then runs home with rumors that iron ships can fire farther than any coastal cannon.', portrait: '/portraits/edo-black-ships-aoi.png' },
    ],
    effects: [
      { cause: 'Foreign pressure forced the end of Japan\'s isolation policy', effect: 'Sudden globalization still reshapes economies and identity today', emoji: '🌊' },
      { cause: 'Steam-powered naval technology demonstrated new military power', effect: 'Technological gaps continue to influence global politics', emoji: '⚓' },
    ],
  },
  {
    id: 'meiji-railway-shock',
    era: 'Early Meiji Japan',
    year: 1872,
    yearLabel: '1872 CE',
    location: 'Shimbashi, Tokyo, Japan',
    coordinates: [139.76, 35.66],
    color: '#5E4B56',
    description: 'Japan\'s first railway opens between Shimbashi and Yokohama, symbolizing modernization while threatening older livelihoods.',
    personas: [
      { name: 'Tobei', role: 'rickshaw puller\'s son', age: 12, gender: 'male', origin: 'ja', details: 'Counts train whistles with awe and dread, wondering if speed will feed his family or leave them behind.', portrait: '/portraits/meiji-railway-shock-tobei.png' },
      { name: 'Kiyo', role: 'ticket runner', age: 11, gender: 'female', origin: 'ja', details: 'Helps queue passengers and hears arguments about whether iron rails honor progress or insult tradition.', portrait: '/portraits/meiji-railway-shock-kiyo.png' },
    ],
    effects: [
      { cause: 'Railways compressed distance and accelerated national integration', effect: 'High-speed mobility still drives economic concentration and social change', emoji: '🚉' },
      { cause: 'New transport technology displaced older urban jobs', effect: 'Automation and platform shifts today continue to disrupt local livelihoods', emoji: '⚙️' },
    ],
  },
  {
    id: 'year-without-summer',
    era: 'Year Without a Summer',
    year: 1816,
    yearLabel: '1816 CE',
    location: 'New England, USA',
    coordinates: [-72.70, 43.90],
    color: '#6C7A89',
    description: 'After the eruption of Mount Tambora, temperatures drop and crops fail. Frost and even snow appear during summer in parts of New England.',
    personas: [
      { name: 'Mercy', role: 'farm child', age: 11, gender: 'female', origin: 'en-US', details: 'Starts July mornings scraping frost from bean leaves and keeps a weather diary beside the stove.', portrait: '/portraits/year-without-summer-mercy.png' },
      { name: 'Jonah', role: 'schoolboy and wood gatherer', age: 12, gender: 'male', origin: 'en-US', details: 'Chops wood in what should be summer and listens as adults argue about leaving for Ohio.', portrait: '/portraits/year-without-summer-jonah.png' },
    ],
    effects: [
      { cause: 'Volcanic ash cooled the climate and disrupted harvests', effect: 'Global climate shocks still threaten food systems and migration patterns', emoji: '🌫️' },
      { cause: 'Families adapted with new crops and relocation plans', effect: 'Communities today still use resilience planning during environmental crises', emoji: '🌽' },
    ],
  },
  {
    id: 'lowell-mill-girls',
    era: 'Early Industrial America',
    year: 1842,
    yearLabel: '1842 CE',
    location: 'Lowell, Massachusetts, USA',
    coordinates: [-71.31, 42.63],
    color: '#5E5E5E',
    description: 'Textile mills run day and night. Young workers face strict schedules and harsh noise, while some build new forms of education and activism.',
    personas: [
      { name: 'Eliza', role: 'child doffer', age: 10, gender: 'female', origin: 'en-US', details: 'Runs frame to frame swapping full bobbins all day, living by mill bells where every minute belongs to the looms.', portrait: '/portraits/lowell-mill-girls-eliza.png' },
      { name: 'Nora', role: 'boardinghouse resident', age: 13, gender: 'female', origin: 'en-US', details: 'Counts bobbins through the shift, then reads borrowed essays in the dormitory parlor under strict matrons.', portrait: '/portraits/lowell-mill-girls-nora.png' },
    ],
    effects: [
      { cause: 'Factory labor concentrated young workers under rigid rules', effect: 'Modern labor law and workplace safety standards grew from these struggles', emoji: '🧵' },
      { cause: 'Workers organized for rights while creating their own publications', effect: 'Youth activism and worker journalism still influence policy change', emoji: '🗞️' },
    ],
  },
  {
    id: 'pnw-industrial-age',
    era: 'Pacific Northwest Logging Boom',
    year: 1913,
    yearLabel: '1913 CE',
    location: 'Puget Sound, Washington, USA',
    coordinates: [-122.33, 47.61],
    color: '#355E3B',
    description: 'Ports, rail lines, and timber camps are transforming the Pacific Northwest into a major industrial region tied to Pacific trade.',
    personas: [
      { name: 'Eleanor', role: 'dockworker\'s daughter', age: 12, gender: 'female', origin: 'en-US', details: 'Born in 1901, she tallies crate marks on the dock and practices penmanship at night by kerosene lamp.', portrait: '/portraits/pnw-industrial-age-eleanor.png' },
      { name: 'Calvin', role: 'sawmill apprentice', age: 13, gender: 'male', origin: 'en-US', details: 'Files saw teeth, oils belt drives, and learns which fir boards earn the best price at the yard.', portrait: '/portraits/pnw-industrial-age-calvin.png' },
    ],
    effects: [
      { cause: 'PNW timber, rail, and port networks expanded quickly', effect: 'Modern supply chains still depend on ports, freight lines, and regional industry', emoji: '🚢' },
      { cause: 'Industrial jobs drew families into fast-growing cities', effect: 'Urban growth planning remains a major challenge in coastal regions', emoji: '🏙️' },
    ],
  },
  {
    id: 'wabash-electric-lights',
    era: 'Electrified Main Street',
    year: 1880,
    yearLabel: '1880 CE',
    location: 'Wabash, Indiana, USA',
    coordinates: [-85.82, 40.80],
    color: '#F2C14E',
    description: 'Wabash becomes one of the first towns lit by electric streetlights, transforming night life and public space in a single evening.',
    personas: [
      { name: 'Clara', role: 'shopkeeper\'s daughter', age: 12, gender: 'female', origin: 'en-US', details: 'On lighting night, she watches the square flare bright as day and hears neighbors cheer and pray at once.', portrait: '/portraits/wabash-electric-lights-clara.png' },
      { name: 'Eli', role: 'telegraph runner', age: 13, gender: 'male', origin: 'en-US', details: 'Runs telegraph slips between station and courthouse while men debate whether the new current might spark fires.', portrait: '/portraits/wabash-electric-lights-eli.png' },
    ],
    effects: [
      { cause: 'Electric lighting extended safe activity into nighttime hours', effect: '24-hour cities and nighttime economies depend on reliable electric infrastructure', emoji: '💡' },
      { cause: 'Public demonstrations helped people trust new technology', effect: 'Technology adoption still depends on visible local proof and community buy-in', emoji: '🌃' },
    ],
  },
  {
    id: 'industrial-england',
    era: 'Industrial Revolution',
    year: 1845,
    yearLabel: '1845 CE',
    location: 'Manchester, England',
    coordinates: [-2.24, 53.48],
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
    id: 'manchester-factory-act',
    era: 'Factory Act England',
    year: 1842,
    yearLabel: '1842 CE',
    location: 'Manchester, England',
    coordinates: [-2.24, 53.48],
    color: '#5A5A5A',
    description: 'New labor protections begin to limit child work hours, creating a painful gap between reform ideals and household survival.',
    personas: [
      { name: 'Lavinia', role: 'cotton mill piecer', age: 12, gender: 'female', origin: 'en-GB', details: 'Proud of her speed at the frames, she fears shorter shifts mean less wage money for bread and coal.', portrait: '/portraits/manchester-factory-act-lavinia.png' },
      { name: 'Tom', role: 'spinner\'s assistant', age: 13, gender: 'male', origin: 'en-GB', details: 'Tracks every missed hour in a notebook and wonders whether safer work can still keep his siblings fed.', portrait: '/portraits/manchester-factory-act-tom.png' },
    ],
    effects: [
      { cause: 'Factory laws targeted dangerous labor conditions for children', effect: 'Worker protections today still require balancing safety with real household economics', emoji: '🧷' },
      { cause: 'Reform exposed conflicts between rights and immediate wages', effect: 'Policy debates still hinge on how transitions are funded for vulnerable families', emoji: '📜' },
    ],
  },
  {
    id: 'dust-bowl-plains',
    era: 'Dust Bowl',
    year: 1935,
    yearLabel: '1935 CE',
    location: 'Oklahoma Panhandle, USA',
    coordinates: [-100.53, 36.68],
    color: '#8B7355',
    description: 'Severe drought and erosion create black blizzards of dust. Families seal windows with cloth and struggle to keep farms alive.',
    personas: [
      { name: 'Ruby', role: 'school student', age: 12, gender: 'female', origin: 'en-US', details: 'Pins wet cloth over her nose for school and sweeps a fresh line of grit from window sills each evening.', portrait: '/portraits/dust-bowl-plains-ruby.png' },
      { name: 'Wes', role: 'farm boy', age: 13, gender: 'male', origin: 'en-US', details: 'Rides fence lines after black blizzards, then contour-plows with his father to keep topsoil from blowing east.', portrait: '/portraits/dust-bowl-plains-wes.png' },
    ],
    effects: [
      { cause: 'Unsustainable plowing and drought triggered massive soil loss', effect: 'Soil conservation and sustainable farming are now core agricultural policy', emoji: '🌪️' },
      { cause: 'Environmental disaster displaced large rural populations', effect: 'Climate migration remains a major challenge in many regions', emoji: '🚚' },
    ],
  },
  {
    id: 'london-blitz-evacuation',
    era: 'World War II Home Front',
    year: 1940,
    yearLabel: '1940 CE',
    location: 'London and rural England',
    coordinates: [-0.13, 51.51],
    color: '#4B5D67',
    description: 'During the Blitz, many children are evacuated from London to the countryside, separated from family for safety.',
    personas: [
      { name: 'Maggie', role: 'evacuated schoolgirl', age: 11, gender: 'female', origin: 'en-GB', details: 'Keeps her gas mask box by the desk, writes Mum each Sunday, and counts days by letters received.', portrait: '/portraits/london-blitz-evacuation-maggie.png' },
      { name: 'Peter', role: 'London evacuee', age: 12, gender: 'male', origin: 'en-GB', details: 'Learns milking before dawn in the village, then listens for wireless news about raids back in London.', portrait: '/portraits/london-blitz-evacuation-peter.png' },
    ],
    effects: [
      { cause: 'Mass child evacuation moved millions away from bombing zones', effect: 'Emergency relocation plans still guide disaster response for families', emoji: '🚂' },
      { cause: 'Wartime separation changed childhood and family life', effect: 'Mental health support is now recognized as part of crisis planning', emoji: '📮' },
    ],
  },
  {
    id: 'buganda-diplomacy',
    era: 'Buganda Kingdom Statecraft',
    year: 1885,
    yearLabel: '1885 CE',
    location: 'Mengo, Buganda Kingdom (Uganda)',
    coordinates: [32.57, 0.30],
    color: '#7A4E2D',
    description: 'Buganda\'s court maneuvers between British, French, and Arab interests, using diplomacy and administration to defend political autonomy.',
    personas: [
      { name: 'Mirembe', role: 'court page and copyist', age: 13, gender: 'female', origin: 'en-GB', details: 'Carries sealed messages between chiefs and foreign envoys, then copies outcomes into palace records.', portrait: '/portraits/buganda-diplomacy-mirembe.png' },
      { name: 'Kato', role: 'drum signal apprentice', age: 12, gender: 'male', origin: 'en-GB', details: 'Learns court rhythms that announce meetings, legal decisions, and urgent diplomatic arrivals.', portrait: '/portraits/buganda-diplomacy-kato.png' },
    ],
    effects: [
      { cause: 'Buganda used skilled administration and diplomacy under colonial pressure', effect: 'Smaller states today still leverage institutions and negotiation to protect sovereignty', emoji: '🏛️' },
      { cause: 'Competing foreign powers reshaped internal political strategy', effect: 'Geopolitical balancing remains central for many nations in contested regions', emoji: '🧭' },
    ],
  },
  {
    id: 'utqiagvik-knowledge',
    era: 'Inupiat Arctic Knowledge',
    year: 1910,
    yearLabel: '1910 CE',
    location: 'Utqiagvik, Alaska, USA',
    coordinates: [-156.79, 71.29],
    color: '#6F8FA8',
    description: 'Inupiat families use detailed sea-ice knowledge, weather reading, and seasonal travel routes while outside schooling systems rapidly expand.',
    personas: [
      { name: 'Tarkik', role: 'young ice observer', age: 10, gender: 'male', origin: 'en-US', details: 'Learns snow names, wind shifts, and ice sounds from elders, then hears teachers insist those words do not belong in class.', portrait: '/portraits/utqiagvik-knowledge-tarkik.png' },
      { name: 'Naluk', role: 'sled runner', age: 11, gender: 'female', origin: 'en-US', details: 'Tests trail firmness with a staff and helps map safe routes where one wrong turn can break through thin ice.', portrait: '/portraits/utqiagvik-knowledge-naluk.png' },
    ],
    effects: [
      { cause: 'Arctic survival relied on precise, place-based environmental vocabulary', effect: 'Indigenous ecological knowledge is now vital to climate science and adaptation planning', emoji: '🧊' },
      { cause: 'Language suppression weakened intergenerational transfer of expertise', effect: 'Language revitalization today is directly tied to cultural and environmental resilience', emoji: '🗺️' },
    ],
  },
  {
    id: 'greenland-mission-transition',
    era: 'Greenland Mission Transition',
    year: 1899,
    yearLabel: '1899 CE',
    location: 'Neu-Herrnhut, near Nuuk, Greenland',
    coordinates: [-51.70, 64.18],
    color: '#6A8799',
    description: 'Families balance hunting knowledge with mission-school routines as church administration shifts at the end of the Moravian era.',
    personas: [
      { name: 'Quloqutsuk', role: 'hunting-family student', age: 9, gender: 'male', origin: 'en-GB', details: 'Learns sled and kayak routes at home, then recites lessons in class while adults debate which customs must not be lost.', portrait: '/portraits/greenland-mission-transition-quloqutsuk.png' },
      { name: 'Aputsiaq', role: 'dog-team helper', age: 11, gender: 'female', origin: 'en-GB', details: 'Checks sea-ice edges before travel and tracks winter by light and dark more than by calendar dates.', portrait: '/portraits/greenland-mission-transition-aputsiaq.png' },
    ],
    effects: [
      { cause: 'Arctic travel systems depended on animal power, sea ice, and seasonal light', effect: 'Polar infrastructure and safety planning still rely on local environmental knowledge', emoji: '🛷' },
      { cause: 'Mission and school transitions reshaped language and daily routines', effect: 'Education policy still has long-term effects on cultural continuity', emoji: '📚' },
    ],
  },
  {
    id: 'tashkent-script-reform',
    era: 'Uzbek Script Reform',
    year: 1929,
    yearLabel: '1929 CE',
    location: 'Tashkent, Uzbek SSR',
    coordinates: [69.24, 41.31],
    color: '#7A6C5D',
    description: 'Schools adopt a new Latin-based Uzbek alphabet while many families still read older Perso-Arabic writing at home.',
    personas: [
      { name: 'Amina', role: 'literacy student', age: 12, gender: 'female', origin: 'ru', details: 'Uses new textbooks at school, then helps elders sound out official notices written in unfamiliar letters.', portrait: '/portraits/tashkent-script-reform-amina.png' },
      { name: 'Rustam', role: 'poster runner', age: 11, gender: 'male', origin: 'ru', details: 'Pins up new alphabet charts and watches neighbors argue over whether reform opens doors or erases memory.', portrait: '/portraits/tashkent-script-reform-rustam.png' },
    ],
    effects: [
      { cause: 'Script reform rapidly changed literacy tools across one generation', effect: 'Writing systems and standards still shape who can access education and public life', emoji: '🔤' },
      { cause: 'Multiple scripts for one language split communities by age and schooling', effect: 'Digital language access today still depends on script compatibility and preservation', emoji: '📝' },
    ],
  },
  {
    id: 'appalachia-midcentury',
    era: 'Mid-Century Appalachia',
    year: 1968,
    yearLabel: '1968 CE',
    location: 'Eastern Kentucky, Appalachia, USA',
    coordinates: [-83.19, 37.57],
    color: '#7C5A3A',
    description: 'Coal towns and mountain communities face rapid economic change while local music, craftsmanship, and family networks stay strong.',
    personas: [
      { name: 'Ruth Ann', role: 'radio station helper', age: 12, gender: 'female', origin: 'en-US', details: 'Born in 1956, she cues bluegrass records at the station and tapes porch stories from older neighbors.', portrait: '/portraits/appalachia-midcentury-ruth-ann.png' },
      { name: 'Dale', role: 'auto shop student', age: 13, gender: 'male', origin: 'en-US', details: 'After school he tunes carburetors in a cinder-block garage and tests trucks on steep holler roads.', portrait: '/portraits/appalachia-midcentury-dale.png' },
    ],
    effects: [
      { cause: 'Communities adapted as energy and mining jobs shifted', effect: 'Workforce retraining and regional investment are still central policy issues', emoji: '🛠️' },
      { cause: 'Appalachian music and oral storytelling stayed vibrant', effect: 'Regional traditions continue to shape American folk and country music', emoji: '🎻' },
    ],
  },
  {
    id: 'space-age',
    era: 'Space Age',
    year: 1969,
    yearLabel: '1969 CE',
    location: 'Houston, Texas, USA',
    coordinates: [-95.37, 29.76],
    color: '#1B3A5C',
    description: 'Humans just walked on the Moon. Computers fill entire rooms, and the future feels like anything is possible.',
    personas: [
      { name: 'Diana', role: 'NASA engineer\'s daughter', age: 12, gender: 'female', origin: 'en-US', details: 'Her mom is one of the few women working at Mission Control. Diana watches rocket launches from the roof of their house.', portrait: '/portraits/space-age-diana.png' },
      { name: 'James', role: 'kid who watched the Moon landing on TV', age: 10, gender: 'male', origin: 'en-US', details: 'His whole neighborhood gathered around one TV to watch Neil Armstrong\'s first step. Now he builds model rockets in his backyard.', portrait: '/portraits/space-age-james.png' },
      { name: 'Miguel', role: 'electronics hobbyist', age: 13, gender: 'male', origin: 'en-US', details: 'Builds crystal radios from spare parts and clips newspaper stories about satellites to his bedroom wall.', portrait: '/portraits/space-age-miguel.png' },
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
