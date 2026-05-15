export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (typeof window !== "undefined") {
    const { supabase } = await import("./supabaseClient");
    const { data } = await supabase.auth.getSession();

    if (data.session?.access_token) {
      headers.Authorization = `Bearer ${data.session.access_token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers,
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();
      message = body.error?.message || message;
    } catch {
      // Keep the status message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export const getApplications = () => request("/api/applications");
export const getApplication = (id) => request(`/api/applications/${id}`);
export const getMetricsSummary = () => request("/api/metrics/summary");
export const getIncidents = (filters = {}) => request(`/api/incidents${toQueryString(filters)}`);
export const getIncident = (id) => request(`/api/incidents/${id}`);
export const getHealthChecks = () => request("/api/health-checks");
export const getLogs = (filters = {}) => request(`/api/logs${toQueryString(filters)}`);

export const runHealthChecks = () => request("/api/health-checks/run", { method: "POST" });

export const resolveIncident = (id) => request(`/api/incidents/${id}/resolve`, { method: "PATCH" });
export const generateIncidentAiSummary = (id) => request(`/api/incidents/${id}/ai-summary`, { method: "POST" });

export const createApplication = (payload) =>
  request("/api/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const rotateApplicationApiKey = (id) =>
  request(`/api/applications/${id}/api-key`, {
    method: "POST",
  });

export const updateApplicationAlertSettings = (id, payload) =>
  request(`/api/applications/${id}/alerts`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
