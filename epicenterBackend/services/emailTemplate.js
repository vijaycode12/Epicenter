export function buildStatusEmailHtml({ incidentType, status, message, location }) {
  const statusColors = {
    'AI Verified': { bg: '#dbeafe', text: '#1e40af' },
    'Waiting for Verification': { bg: '#fef3c7', text: '#92400e' },
    Verified: { bg: '#d1fae5', text: '#065f46' },
    Rejected: { bg: '#fee2e2', text: '#991b1b' },
    Assigned: { bg: '#ede9fe', text: '#5b21b6' },
    Resolved: { bg: '#ccfbf1', text: '#115e59' },
  };
  const color = statusColors[status] || { bg: '#f3f4f6', text: '#374151' };

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color:#0b0d12;padding:28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:20px;font-weight:800;font-family:Georgia,serif;">
                    <span style="color:#ffffff;">EPI</span><span style="color:#e42430;">CENTER</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">
                Report Status Update
              </p>
              <h1 style="margin:0 0 16px;font-size:22px;color:#111827;font-weight:700;">
                ${incidentType}
              </h1>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:${color.bg};color:${color.text};font-size:13px;font-weight:600;padding:6px 14px;border-radius:999px;">
                    ${status}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
                ${message}
              </p>

              ${location ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:10px;margin-bottom:8px;">
                <tr>
                  <td style="padding:14px 16px;font-size:13px;color:#6b7280;">
                    <strong style="color:#374151;">Location:</strong> ${location}
                  </td>
                </tr>
              </table>` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                This is an automated update from Epicenter. If you did not submit this report, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}