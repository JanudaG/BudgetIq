import { useState, useEffect } from "react";

import AppLayout from "./components/layout/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budget from "./pages/Budget.jsx";
import Auth from "./pages/Auth.jsx";
import Analytics from "./pages/Analytics.jsx";

import { api } from "./api/api.js";
import "./App.css";

function ComingSoon() {
  return <h1>Page coming soon!</h1>;
}

const PAGES = {
  dashboard: Dashboard,
  budget: Budget,
  transactions: Transactions,
  analytics: Analytics,
  accounts: ComingSoon,
  settings: ComingSoon,
};

function App() {
  const [activeLink, setActiveLink] = useState("dashboard");

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [envelopes, setEnvelopes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Restore an existing session on page load.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = sessionStorage.getItem("budgetiq_token");

      if (!token) {
        if (active) setAuthLoading(false);
        return;
      }

      try {
        const currentUser = await api.getMe();

        if (active) {
          setUser(currentUser);
        }
      } catch {
        sessionStorage.removeItem("budgetiq_token");
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  // Load data only after a user is authenticated.
  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [t, e] = await Promise.all([
          api.getTransactions(),
          api.getEnvelopes(),
        ]);

        if (active) {
          setTransactions(t);
          setEnvelopes(e);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load your data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [user]);

  // Login or register a user.
  async function handleAuthenticate(mode, formData) {
    const result =
      mode === "register"
        ? await api.register(formData)
        : await api.login(formData);

    sessionStorage.setItem("budgetiq_token", result.token);

    setTransactions([]);
    setEnvelopes([]);
    setError("");
    setActiveLink("dashboard");
    setUser(result.user);
  }

  // End the current session.
  function handleLogout() {
    sessionStorage.removeItem("budgetiq_token");

    setUser(null);
    setTransactions([]);
    setEnvelopes([]);
    setError("");
    setActiveLink("dashboard");
  }

  // TRANSACTIONS

  async function addTransaction(newTransaction) {
    const saved = await api.createTransaction(newTransaction);
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

  // ENVELOPES

  async function addEnvelope(newEnvelope) {
    const saved = await api.createEnvelope(newEnvelope);
    setEnvelopes((prev) => [...prev, saved]);
  }

  async function updateEnvelope(id, changes) {
    const updated = await api.updateEnvelope(id, changes);

    setEnvelopes((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }

  async function deleteEnvelope(id) {
    await api.deleteEnvelope(id);

    setEnvelopes((prev) => prev.filter((e) => e.id !== id));
  }

  // RENDER

  if (authLoading) {
    return <p className="app-status">Checking your session...</p>;
  }

  if (!user) {
    return <Auth onAuthenticate={handleAuthenticate} />;
  }

  const ActivePage = PAGES[activeLink] || ComingSoon;

  return (
    <AppLayout
      activeLink={activeLink}
      onNavigate={setActiveLink}
      user={user}
      onLogout={handleLogout}
    >
      {loading ? (
        <p className="app-status">Loading your budget...</p>
      ) : error ? (
        <div className="app-status" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setUser((prev) => ({ ...prev }))}
          >
            Retry
          </button>
          <button type="button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      ) : (
        <ActivePage
          transactions={transactions}
          onAddTransaction={addTransaction}
          onUpdateTransaction={updateTransaction}
          onDeleteTransaction={deleteTransaction}
          envelopes={envelopes}
          onAddEnvelope={addEnvelope}
          onUpdateEnvelope={updateEnvelope}
          onDeleteEnvelope={deleteEnvelope}
          onNavigate={setActiveLink}
          user={user}
        />
      )}
    </AppLayout>
  );
}

export default App;
