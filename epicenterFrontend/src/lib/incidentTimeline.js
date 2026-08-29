export function buildIncidentTimeline(incident) {
  const reportedAt = incident.createdAt ? new Date(incident.createdAt) : null
  const steps = [
    { key: 'reported', label: 'Report submitted', time: reportedAt, done: Boolean(reportedAt) },
  ]

  const hasAiResult = Boolean(incident.ai?.image?.detectedClass || incident.ai?.text?.predictedType)
  steps.push({
    key: 'ai',
    label: 'AI analysis complete',
    time: hasAiResult ? incident.updatedAt && new Date(incident.updatedAt) : null,
    done: hasAiResult,
  })

  const verified = ['Verified', 'Assigned', 'Resolved'].includes(incident.status)
  steps.push({
    key: 'verified',
    label: 'Verified by officer',
    time: verified ? incident.updatedAt && new Date(incident.updatedAt) : null,
    done: verified,
  })

  const assigned = ['Assigned', 'Resolved'].includes(incident.status)
  steps.push({
    key: 'assigned',
    label: 'Response team assigned',
    time: assigned ? incident.updatedAt && new Date(incident.updatedAt) : null,
    done: assigned,
  })

  const seed = hashString(incident._id || '')
  const reachedMinutes = 10 + (seed % 31) // 10-40 min
  const resolvedMinutes = reachedMinutes + 30 + (seed % 61) // +30-90 min after reached

  const assignedBaseTime = assigned ? incident.updatedAt && new Date(incident.updatedAt) : null
  const reachedAt = assigned && assignedBaseTime ? addMinutes(assignedBaseTime, reachedMinutes) : null
  const reached = assigned && reachedAt && reachedAt <= new Date()

  steps.push({
    key: 'reached',
    label: 'Team reached location',
    time: reached ? reachedAt : null,
    done: Boolean(reached),
    simulated: true,
  })

  const resolved = incident.status === 'Resolved'
  const resolvedAt = reached && reachedAt ? addMinutes(reachedAt, resolvedMinutes) : null

  steps.push({
    key: 'resolved',
    label: 'Resolved',
    time: resolved ? resolvedAt || (incident.updatedAt && new Date(incident.updatedAt)) : null,
    done: resolved,
    simulated: resolved && Boolean(resolvedAt),
  })

  return steps
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000)
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}