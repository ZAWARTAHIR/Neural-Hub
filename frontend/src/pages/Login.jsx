import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../lib/supabase.js";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Login() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    const result = mode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setBusy(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "sign-up" && !result.data.session) {
      setMessage("Account created. Check your email to confirm it, then sign in.");
      setMode("sign-in");
      return;
    }

    navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="mark" />
        <h1>{mode === "sign-in" ? "Welcome back" : "Create your workspace"}</h1>
        <p className="auth-copy">Sign in to keep your campaigns and generated content together.</p>

        {!isSupabaseConfigured && (
          <div className="auth-error">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to frontend/.env first.</div>
        )}
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn btn-blue" type="submit" disabled={busy || !isSupabaseConfigured}>
            {busy ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button className="auth-switch" type="button" onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
          {mode === "sign-in" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
