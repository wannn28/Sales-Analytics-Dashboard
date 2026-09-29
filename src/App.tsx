import { lazy, Suspense, useEffect, useState } from "react";
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({default:m.Dashboard})));
import { Login } from "./pages/Login";
export interface User {
  id: number;
  email: string;
  name: string;
}
export function App() {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const checkSession = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/me");
      if (r.ok) setUser(await r.json());
      else if (r.status !== 401) throw new Error();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void checkSession();
    const expired = () => setUser(null);
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, []);
  const logout = async () => {
    const r = await fetch("/api/auth/logout", { method: "POST" });
    if (!r.ok) throw new Error("Sign out failed. Please try again.");
    setUser(null);
  };
  if (loading)
    return <div className="auth-loading">Opening your workspace…</div>;
  if (error)
    return (
      <div className="auth-loading">
        <p>{error}</p>
        <button className="dark-button" onClick={checkSession}>
          Try again
        </button>
      </div>
    );
  return user ? (
    <Suspense fallback={<div className="auth-loading">Opening your report…</div>}><Dashboard user={user} onLogout={logout} /></Suspense>
  ) : (
    <Login onLogin={setUser} />
  );
}
