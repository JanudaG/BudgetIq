const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export const api = {
  getTransactions: () => request("/transactions"),
  createTransaction: (data) =>
    request("/transactions", { method: "POST", body: JSON.stringify(data) }),
  deleteTransaction: (id) =>
    request(`/transactions/${id}`, { method: "DELETE" }),

  getEnvelopes: () => request("/envelopes"),
  createEnvelope: (data) =>
    request("/envelopes", { method: "POST", body: JSON.stringify(data) }),
  updateEnvelope: (id, changes) =>
    request(`/envelopes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  deleteEnvelope: (id) => request(`/envelopes/${id}`, { method: "DELETE" }),
};
