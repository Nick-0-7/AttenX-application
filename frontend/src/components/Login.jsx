import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import "../templates/Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: "login" or "register"
  const [mode, setMode] = useState(
    location.state?.mode === "register" ? "register" : "login"
  );

  // Sync dark/light mode with portal.jsx via localStorage
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("attenx_theme") === "dark";
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("attenx_theme", next ? "dark" : "light");
      return next;
    });
  };

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [password, setPassword] = useState("");

  // Feedback states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    resetMessages();
  };

  // Sign in handler
  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials. Please try again.");
      }

      // Persist auth details
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      setSuccess("Login successful! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/portal");
      }, 700);
    } catch (err) {
      setError(err.message || "Unable to connect to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Create account handler
  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      // Persist auth details
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate("/portal");
      }, 700);
    } catch (err) {
      setError(err.message || "Registration error. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`auth-page ${darkMode ? "dark" : "light"}`}>
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <div className="auth-top-bar">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Portal
        </button>

        <button
          type="button"
          className="auth-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <section className="auth-container">
        {/* Tab switch between Sign In and Create Account */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => handleModeSwitch("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => handleModeSwitch("register")}
          >
            Create Account
          </button>
        </div>

        <div className="auth-heading">
          <span className="auth-eyebrow">
            STUDENT ATTAINMENT SYSTEM
          </span>

          {mode === "login" ? (
            <>
              <h1>
                Welcome
                <br />
                <span>back.</span>
              </h1>
              <p>
                Sign in to access your attainment dashboard and academic insights.
              </p>
            </>
          ) : (
            <>
              <h1>
                Create
                <br />
                <span>account.</span>
              </h1>
              <p>
                Register your account to manage assessments, OBE mapping, and attainment results.
              </p>
            </>
          )}
        </div>

        {mode === "login" ? (
          <form
            className="auth-form"
            onSubmit={handleLogin}
          >
            <div className="input-group">
              <label>USERNAME OR EMAIL</label>
              <input
                type="text"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <div className="password-label">
                <label>PASSWORD</label>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => setError("Password reset is managed by the department administrator.")}
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="login-error">
                ⚠️ {error}
              </p>
            )}

            {success && (
              <p className="login-success">
                ✓ {success}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <span>↗</span>
            </button>
          </form>
        ) : (
          <form
            className="auth-form"
            onSubmit={handleRegister}
          >
            <div className="input-group">
              <label>USERNAME / FULL NAME</label>
              <input
                type="text"
                placeholder="Choose a username or full name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="input-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="Enter your college email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label>ROLE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="TEACHER">Teacher / Faculty</option>
                <option value="COORDINATOR">OBE Coordinator</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="input-group">
              <label>PASSWORD</label>
              <input
                type="password"
                placeholder="Create a secure password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="login-error">
                ⚠️ {error}
              </p>
            )}

            {success && (
              <p className="login-success">
                ✓ {success}
              </p>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              <span>{loading ? "Creating account..." : "Create Account"}</span>
              <span>↗</span>
            </button>
          </form>
        )}

        <div className="register-link">
          {mode === "login" ? (
            <>
              <span>Don't have an account?</span>
              <button
                type="button"
                onClick={() => handleModeSwitch("register")}
              >
                Create account →
              </button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
              >
                Sign in →
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Login;