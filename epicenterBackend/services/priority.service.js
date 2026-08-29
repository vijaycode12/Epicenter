export const calculatePriorityScore = (incident) => {
  const severityWeight = { Critical: 100, High: 75, Medium: 50, Low: 25 };

  const severityScore = severityWeight[incident.ai?.severity] || 0;

  const imageConfidence = incident.ai?.image?.confidence || 0;
  const textConfidence = incident.ai?.text?.confidence || 0;
  const confidenceScore = Math.max(imageConfidence, textConfidence) * 20;

  const minutesWaiting = (Date.now() - new Date(incident.createdAt).getTime()) / 60000;
  const waitScore = Math.min(minutesWaiting / 2, 30);

  const mismatchBonus = incident.ai?.overallMismatch ? 10 : 0;

  return severityScore + confidenceScore + waitScore + mismatchBonus;
};

export const sortByPriority = (incidents) => {
  return [...incidents].sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a));
};