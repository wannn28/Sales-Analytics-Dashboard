import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ChartNoAxesCombined,
} from "lucide-react";
import { Brand } from "../components/ui";
import type { User } from "../App";
export function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [visible, setVisible] = useState(false),
    [mode, setMode] = useState<"login" | "register">("login"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <Brand />
          iQuee<span>Sales workspace</span>
        </div>
        <div className="login-story-content">
          <div className="eyebrow">
            <span />A clearer picture of your business
          </div>
          <h1>
            Good insights.
            <br />
            Better <em>decisions.</em>
          </h1>
          <p>
            Your revenue, your team, your next opportunity.
            <br />
            All together in one thoughtful workspace.
          </p>
          <div className="login-illustration" aria-hidden="true">
            <div className="illustration-top">
              <span>
                <ChartNoAxesCombined size={17} />
                Revenue overview
              </span>
              <span>↗</span>
            </div>
            <div className="illustration-bars">
              {[32, 46, 38, 65, 54, 79, 68, 93, 82, 100].map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="illustration-bottom">
              <span>Clarity at every step.</span>
              <b>Made for your team ↗</b>
            </div>
          </div>
        </div>
        <div className="login-story-footer">
          A little perspective goes a long way.
          <span>© {new Date().getFullYear()} iQuee</span>
        </div>
      </section>
      <section className="login-form-panel">
        <div className="login-mobile-brand">
          <Brand />
          iQuee
        </div>
        <div className="login-form-inner">
          <span className="login-welcome-icon">
            <LockKeyhole size={23} />
          </span>
          <div className="eyebrow">
            {mode === "register"
              ? "A NEW SPACE FOR YOUR WORK"
              : "YOUR WORKSPACE, AWAITING"}
          </div>
          <h2>
            {mode === "register" ? "Create your workspace." : "Welcome back."}
          </h2>
          <p>
            {mode === "register"
              ? "Start with a clean workspace for your team."
              : "Sign in to see the bigger picture."}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setBusy(true);
              const form = new FormData(e.currentTarget);
              try {
                const registering = mode === "register";
                const r = await fetch(
                  registering ? "/api/auth/register" : "/api/auth/login",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: form.get("email"),
                      password: form.get("password"),
                      ...(registering ? { name: form.get("name") } : {}),
                    }),
                  },
                );
                const result = await r.json();
                if (!r.ok)
                  throw new Error(
                    result.error ||
                      (registering
                        ? "Unable to create account"
                        : "Unable to sign in"),
                  );
                onLogin(result);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Unable to continue");
              } finally {
                setBusy(false);
              }
            }}
          >
            {mode === "register" && (
              <>
                <label htmlFor="name">Your name</label>
                <div className="login-input">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                    minLength={2}
                    maxLength={80}
                    disabled={busy}
                  />
                </div>
              </>
            )}
            <label htmlFor="email">Email address</label>
            <div className="login-input">
              <Mail size={17} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                required
                disabled={busy}
              />
            </div>
            <label htmlFor="password">Password</label>
            <div className="login-input">
              <LockKeyhole size={17} />
              <input
                id="password"
                name="password"
                type={visible ? "text" : "password"}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                placeholder="Enter your password"
                required
                maxLength={72}
                disabled={busy}
              />
              <button
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}
            <button className="login-submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "register"
                  ? "Create my workspace"
                  : "Sign in to your workspace"}
              <ArrowRight size={18} />
            </button>
          </form>
          <button
            type="button"
            className="login-switch"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
          <div className="secure-note">
            <LockKeyhole size={12} />
            Your workspace. Securely connected.
          </div>
        </div>
        <span className="login-form-footer">Less noise. More insight.</span>
      </section>
    </div>
  );
}
