export interface HistoryEntity {
  id: string
  label: string
  description: string
  wiki: string
  aliases?: string[]
}

export const HISTORY_ENTITIES: HistoryEntity[] = [
  {
    id: 'leonardo-da-vinci',
    label: 'Leonardo da Vinci',
    description: 'A famous artist and inventor from the Renaissance who painted the Mona Lisa and studied science.',
    wiki: 'https://simple.wikipedia.org/wiki/Leonardo_da_Vinci',
  },
  {
    id: 'nile',
    label: 'Nile',
    description: 'A very long river in Egypt that gave people water, food, and travel routes.',
    wiki: 'https://simple.wikipedia.org/wiki/Nile',
    aliases: ['the Nile', 'Nile River'],
  },
  {
    id: 'papyrus',
    label: 'papyrus',
    description: 'A plant in Egypt that people used to make early paper for writing.',
    wiki: 'https://simple.wikipedia.org/wiki/Papyrus',
  },
  {
    id: 'pharaoh',
    label: 'pharaoh',
    description: 'The king or queen of Ancient Egypt, believed to rule with help from the gods.',
    wiki: 'https://simple.wikipedia.org/wiki/Pharaoh',
  },
  {
    id: 'silk-road',
    label: 'Silk Road',
    description: 'A network of trade routes that connected China, Asia, and Europe.',
    wiki: 'https://simple.wikipedia.org/wiki/Silk_Road',
  },
  {
    id: 'gutenberg',
    label: 'Johannes Gutenberg',
    description: 'A European inventor who helped make printing faster with the printing press.',
    wiki: 'https://simple.wikipedia.org/wiki/Johannes_Gutenberg',
    aliases: ['Gutenberg'],
  },
  {
    id: 'printing-press',
    label: 'printing press',
    description: 'A machine that makes many copies of books and papers quickly.',
    wiki: 'https://simple.wikipedia.org/wiki/Printing_press',
  },
  {
    id: 'mansa-musa',
    label: 'Mansa Musa',
    description: 'A famous ruler of the Mali Empire known for great wealth and learning.',
    wiki: 'https://simple.wikipedia.org/wiki/Mansa_Musa',
  },
  {
    id: 'timbuktu',
    label: 'Timbuktu',
    description: 'A historic city in Mali that became a center for trade and learning.',
    wiki: 'https://simple.wikipedia.org/wiki/Timbuktu',
  },
  {
    id: 'great-wall',
    label: 'Great Wall of China',
    description: 'A long wall built in China to help protect against invasions.',
    wiki: 'https://simple.wikipedia.org/wiki/Great_Wall_of_China',
    aliases: ['Great Wall'],
  },
  {
    id: 'industrial-revolution',
    label: 'Industrial Revolution',
    description: 'A time when machines and factories changed how people worked and lived.',
    wiki: 'https://simple.wikipedia.org/wiki/Industrial_Revolution',
  },
  {
    id: 'steam-engine',
    label: 'steam engine',
    description: 'A machine that uses steam to move things like trains and factory equipment.',
    wiki: 'https://simple.wikipedia.org/wiki/Steam_engine',
  },
  {
    id: 'moon-landing',
    label: 'Moon landing',
    description: 'When humans first walked on the Moon in 1969.',
    wiki: 'https://simple.wikipedia.org/wiki/Moon_landing',
    aliases: ['the Moon landing'],
  },
  {
    id: 'nasa',
    label: 'NASA',
    description: 'The United States space agency that sends astronauts and spacecraft into space.',
    wiki: 'https://simple.wikipedia.org/wiki/NASA',
  },
]
