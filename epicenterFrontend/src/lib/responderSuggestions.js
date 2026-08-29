export function getResponderOptions(placeName) {
  const name = (placeName || '').trim()
  if (!name) {
    return [
      { id: 'police', label: 'Local Police Station' },
      { id: 'fire', label: 'Local Fire Station' },
      { id: 'hospital', label: 'Nearby Hospital' },
      { id: 'ambulance', label: 'Ambulance Service' },
    ]
  }

  return [
    { id: 'police', label: `${name} Police Station` },
    { id: 'fire', label: `${name} Fire Station` },
    { id: 'hospital', label: `${name} Hospital (Nearest)` },
    { id: 'ambulance', label: `${name} Ambulance Service` },
  ]
}