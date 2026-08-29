const OFFICER_TOKEN_KEY = 'epicenter_officer_token'
const OFFICER_PROFILE_KEY = 'epicenter_officer_profile'

export function getOfficerToken() {
  return window.localStorage.getItem(OFFICER_TOKEN_KEY) || window.sessionStorage.getItem(OFFICER_TOKEN_KEY)
}

export function getOfficerProfile() {
  const stored = window.localStorage.getItem(OFFICER_PROFILE_KEY) || window.sessionStorage.getItem(OFFICER_PROFILE_KEY)
  return stored ? JSON.parse(stored) : null
}

export function setOfficerSession({ token, officer, remember }) {
  const storage = remember ? window.localStorage : window.sessionStorage
  storage.setItem(OFFICER_TOKEN_KEY, token)
  storage.setItem(OFFICER_PROFILE_KEY, JSON.stringify(officer))
}

export function clearOfficerToken() {
  window.localStorage.removeItem(OFFICER_TOKEN_KEY)
  window.sessionStorage.removeItem(OFFICER_TOKEN_KEY)
  window.localStorage.removeItem(OFFICER_PROFILE_KEY)
  window.sessionStorage.removeItem(OFFICER_PROFILE_KEY)
}