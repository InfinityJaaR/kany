/** Normaliza teléfono salvadoreño a formato +503XXXXXXXX */
export function normalizeSvPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')

  if (digits.length === 8) {
    return `+503${digits}`
  }
  if (digits.length === 11 && digits.startsWith('503')) {
    return `+${digits}`
  }
  if (digits.length === 12 && digits.startsWith('503')) {
    return `+${digits}`
  }

  return null
}

export function isValidSvPhone(input: string): boolean {
  return normalizeSvPhone(input) !== null
}
