export interface TimelineEvent {
  id: string
  label: string
  year: number
  yearLabel: string
  description: string
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'great-wall',
    label: 'Great Wall built',
    year: -200,
    yearLabel: '~200 BCE',
    description: 'Fortifications in China start connecting into the Great Wall.',
  },
  {
    id: 'printing-press',
    label: 'Printing press spreads',
    year: 1450,
    yearLabel: '~1450 CE',
    description: 'Printed books begin to spread ideas quickly in Europe.',
  },
  {
    id: 'columbus',
    label: 'Columbus sails',
    year: 1492,
    yearLabel: '1492 CE',
    description: 'Columbus crosses the Atlantic Ocean.',
  },
  {
    id: 'steam-engine',
    label: 'Steam engines rise',
    year: 1776,
    yearLabel: '1776 CE',
    description: 'Steam power transforms factories and transportation.',
  },
  {
    id: 'first-airplane',
    label: 'First airplane flight',
    year: 1903,
    yearLabel: '1903 CE',
    description: 'The Wright brothers fly the first powered airplane.',
  },
  {
    id: 'moon-landing',
    label: 'Moon landing',
    year: 1969,
    yearLabel: '1969 CE',
    description: 'Humans walk on the Moon for the first time.',
  },
]
