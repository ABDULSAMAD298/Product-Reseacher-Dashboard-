import React, { useState } from 'react';
import CONFIG from '../config.js';
import { Field, IconAlert } from './ui.jsx';

const AUTH_KEY = 'isAuthenticated';

// ── Auth flag helpers (localStorage) ─────────────────────────────────────────

export function isAuthenticated() {
  try {
    return localStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function clearAuth() {
  try { localStorage.removeItem(AUTH_KEY); } catch {}
}

function setAuth() {
  try { localStorage.setItem(AUTH_KEY, 'true'); } catch {}
}

// ── Login Screen ─────────────────────────────────────────────────────────────

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() === CONFIG.LOGIN_USERNAME && password === CONFIG.LOGIN_PASSWORD) {
      setAuth();
      onLogin();
    } else {
      setError('Invalid username or password');
      setPassword('');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-sm mx-auto">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200" role="alert">
          <IconAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <Field label="Username">
        <input
          id="username"
          type="text"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="field-base"
        />
      </Field>

      <Field label="Password">
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-base"
        />
      </Field>

      <button
        type="submit"
        id="login-btn"
        disabled={!username.trim() || !password}
        className="btn-primary w-full justify-center py-3"
      >
        Login
      </button>
    </form>
  );
}
