import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";
import "../templates/Auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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

      setSuccess("Account registered successfully! Redirecting...");
      setTimeout(() => {
        navigate("/portal");
      }, 700);
    } catch (err) {
      setError(err.message || "Registration failed. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one"></div>
      <div className="auth-glow auth-glow-two"></div>

      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Back
      </button>

      <section className="auth-container">
        <div className="auth-heading">
          <span className="auth-eyebrow">
            STUDENT ATTAINMENT SYSTEM
          </span>

          <h1>
            Create
            <br />
            <span>account.</span>
          </h1>

          <p>
            Create your account to manage assessments, mapping, and student attainment.
          </p>
        </div>

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
              placeholder="Create a password (min 6 chars)"
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

        <div className="register-link">
          <span>Already have an account?</span>
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Sign in →
          </button>
        </div>
      </section>
    </main>
  );
};

export default Register;