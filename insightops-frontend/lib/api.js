const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export const getApplications = () => request("/api/applications");
export const getApplication = (id) => request(`/api/applications/${id}`);
export const getMetricsSummary = () => request("/api/metrics/summary");
export const getIncidents = () => request("/api/incidents");
export const getHealthChecks = () => request("/api/health-checks");
export const getLogs = () => request("/api/logs");

export const runHealthChecks = () => request("/api/health-checks/run", { method: "POST" });

export const resolveIncident = (id) => request(`/api/incidents/${id}/resolve`, { method: "PATCH" });

export const createApplication = (payload) =>
  request("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
