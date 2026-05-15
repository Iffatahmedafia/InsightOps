const { prisma } = require("../config/prisma");

const ALERT_TYPES = {
  INCIDENT_OPENED: "incident_opened",
  INCIDENT_RESOLVED: "incident_resolved",
};

async function sendIncidentOpenedAlert(incident) {
  const fullIncident = await getIncidentWithApplication(incident.id);

  if (!fullIncident || !shouldSendOpenedAlert(fullIncident)) {
    return { sent: false, reason: "alerts_disabled" };
  }

  if (fullIncident.openedAlertSentAt) {
    return { sent: false, reason: "already_sent" };
  }

  const result = await sendIncidentEmail({
    incident: fullIncident,
    subject: `[InsightOps] ${fullIncident.severity.toUpperCase()} incident: ${fullIncident.title}`,
    preview: "A new incident was opened in InsightOps.",
    alertType: ALERT_TYPES.INCIDENT_OPENED,
  });

  if (result.sent) {
    await prisma.incident.update({
      where: { id: fullIncident.id },
      data: { openedAlertSentAt: new Date() },
    });
  }

  return result;
}

async function sendIncidentResolvedAlert(incident) {
  const fullIncident = await getIncidentWithApplication(incident.id);

  if (!fullIncident || !shouldSendResolvedAlert(fullIncident)) {
    return { sent: false, reason: "alerts_disabled" };
  }

  if (fullIncident.resolvedAlertSentAt) {
    return { sent: false, reason: "already_sent" };
  }

  const result = await sendIncidentEmail({
    incident: fullIncident,
    subject: `[InsightOps] Resolved: ${fullIncident.title}`,
    preview: "An InsightOps incident was resolved.",
    alertType: ALERT_TYPES.INCIDENT_RESOLVED,
  });

  if (result.sent) {
    await prisma.incident.update({
      where: { id: fullIncident.id },
      data: { resolvedAlertSentAt: new Date() },
    });
  }

  return result;
}

async function getIncidentWithApplication(id) {
  return prisma.incident.findUnique({
    where: { id },
    include: {
      application: true,
    },
  });
}

function shouldSendOpenedAlert(incident) {
  const app = incident.application;

  if (!app?.alertsEnabled || !app.alertEmail) {
    return false;
  }

  if (incident.type === "service_down") {
    return app.serviceDownAlertsEnabled;
  }

  return app.incidentOpenedAlertsEnabled;
}

function shouldSendResolvedAlert(incident) {
  const app = incident.application;
  return Boolean(app?.alertsEnabled && app.alertEmail && app.incidentResolvedAlertsEnabled);
}

async function sendIncidentEmail({ alertType, incident, preview, subject }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ALERT_FROM_EMAIL;
  const toEmail = incident.application.alertEmail;

  if (!apiKey || !fromEmail) {
    console.warn("Email alerts are configured in app settings, but RESEND_API_KEY or ALERT_FROM_EMAIL is missing.");
    return { sent: false, reason: "provider_not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html: renderIncidentEmail({ alertType, incident, preview }),
      text: renderIncidentEmailText({ alertType, incident, preview }),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    console.error(`Email alert failed with status ${response.status}: ${message}`);
    return { sent: false, reason: "provider_error" };
  }

  return { sent: true };
}

function renderIncidentEmail({ alertType, incident, preview }) {
  const app = incident.application;
  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "http://localhost:3000";
  const incidentUrl = `${frontendUrl.replace(/\/$/, "")}/incidents/${incident.id}`;
  const endpoint = [incident.method, incident.route].filter(Boolean).join(" ") || "No route captured";
  const statusLabel = alertType === ALERT_TYPES.INCIDENT_RESOLVED ? "Resolved" : "Opened";

  return `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;text-transform:uppercase;color:#2563eb;">InsightOps alert</p>
        <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;">${escapeHtml(incident.title)}</h1>
        <p style="margin:0 0 20px;color:#475569;">${escapeHtml(preview)}</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
          ${renderRow("Status", statusLabel)}
          ${renderRow("Severity", incident.severity)}
          ${renderRow("Application", `${app.name} (${app.environment})`)}
          ${renderRow("Endpoint", endpoint)}
          ${renderRow("Type", incident.type)}
          ${renderRow("Opened", new Date(incident.openedAt).toLocaleString())}
        </table>
        <p style="margin:0 0 20px;color:#475569;">${escapeHtml(incident.rootCauseHint || "Review the incident details and related telemetry in InsightOps.")}</p>
        <a href="${incidentUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;border-radius:8px;padding:12px 16px;">Open incident</a>
      </div>
    </div>
  `;
}

function renderIncidentEmailText({ alertType, incident, preview }) {
  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "http://localhost:3000";
  const incidentUrl = `${frontendUrl.replace(/\/$/, "")}/incidents/${incident.id}`;
  const endpoint = [incident.method, incident.route].filter(Boolean).join(" ") || "No route captured";
  const statusLabel = alertType === ALERT_TYPES.INCIDENT_RESOLVED ? "Resolved" : "Opened";

  return [
    `InsightOps alert: ${incident.title}`,
    preview,
    `Status: ${statusLabel}`,
    `Severity: ${incident.severity}`,
    `Application: ${incident.application.name} (${incident.application.environment})`,
    `Endpoint: ${endpoint}`,
    `Type: ${incident.type}`,
    `Opened: ${new Date(incident.openedAt).toLocaleString()}`,
    `Hint: ${incident.rootCauseHint || "Review the incident details and related telemetry in InsightOps."}`,
    `Open incident: ${incidentUrl}`,
  ].join("\n");
}

function renderRow(label, value) {
  return `
    <tr>
      <td style="border-top:1px solid #e2e8f0;padding:10px 0;color:#64748b;font-size:13px;">${escapeHtml(label)}</td>
      <td style="border-top:1px solid #e2e8f0;padding:10px 0;text-align:right;font-weight:700;font-size:13px;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = {
  sendIncidentOpenedAlert,
  sendIncidentResolvedAlert,
};
