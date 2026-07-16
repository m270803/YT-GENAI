import React, { useState } from 'react'
import "../auth.scss"
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const LogIn = () => {
  const { loading, handleLogin } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password) {
      setError("Email and password are required.")
      return
    }

    try {
      await handleLogin({ email, password })
      navigate("/")
    } catch (err) {
      setError(err?.message || "Invalid email or password.")
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-mark" />
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Log in to pick up where you left off.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.5A9.6 9.6 0 0 1 12 5c5 0 8.5 4 9.9 7-.5 1.05-1.2 2.1-2.1 3.05M6.2 6.9C4.4 8.1 3.1 9.9 2.1 12c1.4 3 4.9 7 9.9 7 1.3 0 2.5-.25 3.6-.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2.1 12C3.5 9 7 5 12 5s8.5 4 9.9 7c-1.4 3-4.9 7-9.9 7s-8.5-4-9.9-7Z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="button primary-button" type="submit" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : "Log in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  )
}

export default LogIn