import type { LostPetStatus } from '@/lib/pets-utils'

const MAX_REWARD_AMOUNT = 10_000
const MAX_BREED_COLOR_LENGTH = 200
const MAX_DETAILS_LENGTH = 500

const EL_SALVADOR_PHONE_REGEX = /^\+503(2|6|7)\d{7}$/

export type PetReportFormInput = {
  tipo: string
  nombre: string
  raza: string
  color: string
  zona: string
  contacto: string
  detalles: string
  tieneRecompensa: boolean
  montoRecompensa: string
}

export function normalizeElSalvadorPhone(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const digitsOnly = trimmed.replace(/\D/g, '')

  let localDigits: string
  if (digitsOnly.startsWith('503') && digitsOnly.length === 11) {
    localDigits = digitsOnly.slice(3)
  } else if (digitsOnly.length === 8) {
    localDigits = digitsOnly
  } else {
    return null
  }

  const normalized = `+503${localDigits}`
  if (!EL_SALVADOR_PHONE_REGEX.test(normalized)) return null

  return `+503 ${localDigits.slice(0, 4)}-${localDigits.slice(4)}`
}

export function validateElSalvadorPhone(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) {
    return 'El teléfono de contacto es obligatorio.'
  }

  if (!normalizeElSalvadorPhone(trimmed)) {
    return 'Usa un teléfono válido de El Salvador: +503 seguido de 8 dígitos (ej. +503 7123-4567).'
  }

  return null
}

export function formatRewardAmount(monto: string): string | null {
  const trimmed = monto.trim()
  if (!trimmed) return null

  const amount = Number(trimmed)
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (amount > MAX_REWARD_AMOUNT) return null

  const formatted = Number.isInteger(amount)
    ? String(amount)
    : amount.toFixed(2).replace(/\.?0+$/, '')

  return `$${formatted}`
}

function validateReward(tieneRecompensa: boolean, montoRecompensa: string): string | null {
  if (!tieneRecompensa) return null

  const trimmed = montoRecompensa.trim()
  if (!trimmed) {
    return 'Ingresa el monto de la recompensa.'
  }

  const amount = Number(trimmed)
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'El monto debe ser un número mayor a 0.'
  }

  if (amount > MAX_REWARD_AMOUNT) {
    return `El monto no puede superar $${MAX_REWARD_AMOUNT.toLocaleString('en-US')}.`
  }

  return null
}

export function validatePetReportForm(input: PetReportFormInput): Record<string, string> {
  const errors: Record<string, string> = {}

  const nombre = input.nombre.trim()
  if (!nombre) {
    errors.nombre = 'El nombre o tipo de mascota es obligatorio.'
  } else if (nombre.length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres.'
  }

  const zona = input.zona.trim()
  if (!zona) {
    errors.zona = 'La zona es obligatoria.'
  } else if (zona.length < 3) {
    errors.zona = 'La zona debe tener al menos 3 caracteres.'
  }

  const contactError = validateElSalvadorPhone(input.contacto)
  if (contactError) {
    errors.contacto = contactError
  }

  if (input.raza.trim().length > MAX_BREED_COLOR_LENGTH) {
    errors.raza = `La raza no puede superar ${MAX_BREED_COLOR_LENGTH} caracteres.`
  }

  if (input.color.trim().length > MAX_BREED_COLOR_LENGTH) {
    errors.color = `El color no puede superar ${MAX_BREED_COLOR_LENGTH} caracteres.`
  }

  if (input.detalles.trim().length > MAX_DETAILS_LENGTH) {
    errors.detalles = `Los detalles no pueden superar ${MAX_DETAILS_LENGTH} caracteres.`
  }

  if (input.tipo === 'perdida') {
    const rewardError = validateReward(input.tieneRecompensa, input.montoRecompensa)
    if (rewardError) {
      errors.montoRecompensa = rewardError
    }
  }

  return errors
}

export function isValidLostPetStatus(status: string): status is LostPetStatus {
  return status === 'critical' || status === 'urgent' || status === 'normal'
}
