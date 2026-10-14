import { useState } from "react";
import AppLayout from "./components/layout/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import { initialTransactions, initialEnvelopes } from "./constants/mockData.js";
import Budget from './pages/Budget.jsx'
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
  const [transactions, setTransactions] = useState(initialTransactions);
  const [envelopes, setEnvelopes] = useState(initialEnvelopes); // no setter yet: limits become editable on the Budget page

  function addTransaction(newTransaction) {
    // New array (never push onto the old one) so React sees the change.

    setTransactions((prev) => [{ ...newTransaction, id: Date.now() }, ...prev]);
  }
  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }
  function addEnvelope(newEnvelope) {
    setEnvelopes((prev) => [...prev, { ...newEnvelope, id: Date.now() }]);
  }

  function updateEnvelope(id, changes) {
  // `changes` is an object like { limit: 800 } or { rollover: true }.
  setEnvelopes((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)))
}

  function deleteEnvelope(id) {
    setEnvelopes((prev) => prev.filter((e) => e.id !== id));
  }

  const ActivePage = PAGES[activeLink] || ComingSoon;

  return (
    <AppLayout activeLink={activeLink} onNavigate={setActiveLink}>
      <ActivePage
        transactions={transactions}
        onDeleteTransaction={deleteTransaction}
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
