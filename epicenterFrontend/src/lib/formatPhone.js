export function formatPhone(raw) {
  if (!raw) return raw
  const digitsOnly = String(raw).replace(/\D/g, '')
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`
  }
  return raw
}