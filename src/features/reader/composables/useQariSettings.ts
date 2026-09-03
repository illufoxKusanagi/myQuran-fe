export interface Qari {
  id: string
  name: string
  folder: string
}

export const QARIS: Qari[] = [
  { id: 'alafasy', name: 'Mishary Alafasy', folder: 'Alafasy_128kbps' },
  { id: 'sudais', name: 'Abdul Rahman Al-Sudais', folder: 'Abdurrahman_As-Sudais_64kbps' },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi', folder: 'Ghamadi_40kbps' },
  { id: 'husary', name: 'Mahmoud Al-Husary', folder: 'Husary_128kbps' },
]

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5] as const
