const CITIZEN_AUTH_KEY = 'epicenter_citizen_auth'

export function getCitizenAuth() {
  const stored = window.sessionStorage.getItem(CITIZEN_AUTH_KEY)
  return stored ? JSON.parse(stored) : null
}

export function setCitizenAuth(value) {
  if (value) {
    window.sessionStorage.setItem(CITIZEN_AUTH_KEY, JSON.stringify(value))
  } else {
    window.sessionStorage.removeItem(CITIZEN_AUTH_KEY)
  }
}

export function clearCitizenAuth() {
  window.sessionStorage.removeItem(CITIZEN_AUTH_KEY)
}