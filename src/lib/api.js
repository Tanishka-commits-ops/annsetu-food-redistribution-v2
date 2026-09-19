const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

export const apiConfigured = Boolean(BASE_URL);

async function request(path, options = {}) {
  if (!BASE_URL) return { offline: true, data: null };

  const token = localStorage.getItem("annsetu_access_token");

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Something went wrong.");
  }

  if (response.status === 204) return { data: null };

  return { data: await response.json() };
}

export const api = {
  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  signup: (body) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  kitchenDashboard: () => request("/kitchen/dashboard"),

  createListing: (body) =>
    request("/kitchen/listings", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  getListing: (id) => request(`/kitchen/listings/${id}`),

  urgentMatch: (id) =>
    request(`/kitchen/listings/${id}/urgent-match`, {
      method: "POST"
    }),

  recipientOffers: () => request("/recipient/offers"),

  respondToOffer: (id, decision) =>
    request(`/recipient/offers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ decision })
    }),

  getPickup: (id) => request(`/volunteer/pickups/${id}`),

  verifyDelivery: (id, otp) =>
    request(`/volunteer/pickups/${id}/verify-delivery`, {
      method: "POST",
      body: JSON.stringify({ otp })
    }),

  impact: () => request("/impact"),

  compliance: () => request("/compliance/handovers"),

  exportRegister: (format) =>
    `${BASE_URL}/compliance/handovers/export?format=${format}`
};
