import {
  IconFlame,
  IconTruck,
  IconBale,
  IconGear,
  IconDroplet,
  IconSeed,
  IconSplit,
} from '../components/icons.jsx'

// Stations shown on the Report page, one module per station.
// Colors are distinct flat hues so each tile reads at a glance.

export const stations = [
  { slug: 'boiler', name: 'Boiler', icon: IconFlame, color: '#e0913f' },
  { slug: 'ffb-reception', name: 'FFB Reception', icon: IconTruck, color: '#2f8f9d' },
  { slug: 'efb-press', name: 'EFB Press', icon: IconBale, color: '#7a9d54' },
  { slug: 'press', name: 'Press', icon: IconGear, color: '#6b7280' },
  {
    slug: 'clarification-oil-recovery',
    name: 'Clarification & Oil Recovery',
    icon: IconDroplet,
    color: '#3d5a80',
  },
  { slug: 'kernel-plant', name: 'Kernel Plant', icon: IconSeed, color: '#a8925f' },
  { slug: 'depericarping', name: 'Depericarping', icon: IconSplit, color: '#5b6ee1' },
]

export function getStation(slug) {
  return stations.find((s) => s.slug === slug)
}
