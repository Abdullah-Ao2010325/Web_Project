'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success) {
      router.push('/stats');
    } else {
      setError(data.message);
    }
  };

  return (
    <>
      <div className="blur-bg-overlay show-popup" />
      <section className="form-interface show-popup">
        <div className="login-form-box">
          <div className="form-info">
            <h2>Admin Access</h2>
            <p>Only administrators can access system statistics.</p>
          </div>
          <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="input-field">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label>Username</label>
              </div>
              <div className="input-field">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label>Password</label>
              </div>
              <button type="submit">Login</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
