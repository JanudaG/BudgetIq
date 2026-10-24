import { useState, useEffect } from "react";
import AppLayout from "./components/layout/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";

import { api } from "./api/api.js";
import Budget from "./pages/Budget.jsx";
import "./App.css";

function ComingSoon() {
  return <h1>Page coming soon!</h1>;
}

// Maps a nav key to the page component for it.
const PAGES = {
  dashboard: Dashboard,
  budget: Budget,
  transactions: Transactions,
  analytics: ComingSoon,
  accounts: ComingSoon,
  settings: ComingSoon,
};

function App() {
  const [activeLink, setActiveLink] = useState("dashboard");

  // Shared data lives here, in the closest common parent, so every page
  // (and later the Transactions and Budget pages) sees the same data.
  const [transactions, setTransactions] = useState([]);
  const [envelopes, setEnvelopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getTransactions(), api.getEnvelopes()])
      .then(([t, e]) => {
        setTransactions(t);
        setEnvelopes(e);
      })
      .catch(() => setError("Could not reach the server. Is it running?"))
      .finally(() => setLoading(false));
  }, []); // no setter yet: limits become editable on the Budget page

  async function addTransaction(newTransaction) {
    const saved = await api.createTransaction(newTransaction); // wait for the server's copy (it has the real id)
    setTransactions((prev) => [saved, ...prev]);
  }
  async function updateTransaction(id, changes) {
    const updated = await api.updateTransaction(id, changes);

    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function deleteTransaction(id) {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  async function addEnvelope(newEnvelope) {
    const saved = await api.createEnvelope(newEnvelope);
    setEnvelopes((prev) => [...prev, saved]);
  }

  async function updateEnvelope(id, changes) {
    // Update the screen first so typing in the limit box feels instant, then save.
    setEnvelopes((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    );
    await api.updateEnvelope(id, changes);
  }

  async function deleteEnvelope(id) {
    await api.deleteEnvelope(id);
    setEnvelopes((prev) => prev.filter((e) => e.id !== id));
  }

  if (loading) return <p className="app-status">Loading your budget...</p>;
  if (error) return <p className="app-status">{error}</p>;

  const ActivePage = PAGES[activeLink] || ComingSoon;

  return (
    <AppLayout activeLink={activeLink} onNavigate={setActiveLink}>
      <ActivePage
        transactions={transactions}
        onDeleteTransaction={deleteTransaction}
        onUpdateTransaction={updateTransaction}
        envelopes={envelopes}
        onAddTransaction={addTransaction}
        onNavigate={setActiveLink}
        onAddEnvelope={addEnvelope}
        onUpdateEnvelope={updateEnvelope}
        onDeleteEnvelope={deleteEnvelope}
      />
    </AppLayout>
  );
}

export default App;
