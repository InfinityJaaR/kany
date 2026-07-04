export interface FoodPrice {
  brand: string
  weight: string
  price: number
  store: string
  available: string
}

export const foodPrices: FoodPrice[] = [
  { brand: 'Dog Chow Adulto', weight: '8 lb', price: 18.5, store: 'PetMarket SV', available: 'Disponible' },
  { brand: 'Pro Plan Puppy', weight: '6 lb', price: 32.0, store: 'Animal Store', available: 'Pocas unidades' },
  { brand: 'Cat Chow Gatitos', weight: '3 kg', price: 21.75, store: 'Huellitas Shop', available: 'Disponible' },
  { brand: 'NutriCan Adulto', weight: '10 lb', price: 16.99, store: 'Agroservicio Central', available: 'Disponible' },
]
