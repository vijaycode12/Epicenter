
export function buildStatusWhatsAppMessage({ incidentType, status, message, location, referenceId }) {
  const lines = [
    `*EPICENTER* - Report Update`,
    ``,
    `Your *${incidentType}* report status: *${status}*`,
    ``,
    message,
  ];

  if (location) {
    lines.push(``, `Location: ${location}`);
  }

  if (referenceId) {
    lines.push(`Reference: #${referenceId}`);
  }

  lines.push(``, `_This is an automated message from Epicenter._`);

  return lines.join("\n");
}