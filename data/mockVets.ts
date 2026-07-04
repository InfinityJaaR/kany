export interface VetClinic {
  name: string
  services: string[]
  location: string
  phone: string
  hours: string
  promo: string
}

export const vets: VetClinic[] = [
  {
    name: 'Clínica Veterinaria Huellitas',
    services: ['Emergencias', 'Vacunación', 'Cirugía'],
    location: 'San Salvador',
    phone: '+503 2212-3344',
    hours: 'Lun-Sáb 8:00 AM - 6:00 PM',
    promo: '10% en consulta para rescatistas',
  },
  {
    name: 'VetCare Santa Tecla',
    services: ['Consulta general', 'Esterilización', 'Laboratorio'],
    location: 'Santa Tecla',
    phone: '+503 2288-1100',
    hours: 'Todos los días 7:00 AM - 7:00 PM',
    promo: 'Jornada de vacunación mensual',
  },
  {
    name: 'Animalia 24/7',
    services: ['Emergencias 24/7', 'Hospitalización', 'Rayos X'],
    location: 'Antiguo Cuscatlán',
    phone: '+503 7000-2424',
    hours: '24 horas',
    promo: 'Aliada en casos urgentes verificados',
  },
]
