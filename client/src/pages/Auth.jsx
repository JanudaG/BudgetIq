
import { useState } from "react";

function Auth({ onAuthenticate }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && name.trim().length < 2) {
      setError("Enter a name with at least 2 characters.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    if (isRegister && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await onAuthenticate(mode, {
        ...(isRegister ? { name: name.trim() } : {}),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError("");
    setPassword("");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand__mark">B</span>
          <div>
            <h1>BudgetIQ</h1>
            <p>Financial OS</p>
          </div>
        </div>

        <h2>
          {isRegister ? "Create your account" : "Welcome back"}
        </h2>

        <p className="auth-description">
          {isRegister
            ? "Start managing your finances with BudgetIQ."
            : "Sign in to access your financial dashboard."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <label>
              Full Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                minLength={2}
                required
              />
            </label>
          )}

          <label>
            Email Address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={
                isRegister ? "new-password" : "current-password"
              }
              minLength={isRegister ? 6 : undefined}
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-dark auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}

          <button type="button" onClick={switchMode}>
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default Auth;
