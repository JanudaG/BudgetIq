const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = sessionStorage.getItem("budgetiq_token");

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => request("/auth/me"),

  getTransactions: () => request("/transactions"),

  createTransaction: (data) =>
    request("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTransaction: (id, changes) =>
    request(`/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),

  deleteTransaction: (id) =>
    request(`/transactions/${id}`, {
      method: "DELETE",
    }),

  getEnvelopes: () => request("/envelopes"),

  createEnvelope: (data) =>
    request("/envelopes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEnvelope: (id, changes) =>
    request(`/envelopes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),

  deleteEnvelope: (id) =>
    request(`/envelopes/${id}`, {
      method: "DELETE",
    }),
};
