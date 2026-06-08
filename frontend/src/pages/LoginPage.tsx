import { useState } from 'react'

interface Props {
  onLogin: () => void
}

export default function LoginPage({
  onLogin,
}: Props) {
  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  const handleLogin = () => {
    if (
      email === 'demo@tokeniser.ai' &&
      password === 'tokeniser123'
    ) {
      localStorage.setItem(
        'tokeniser-auth',
        'true',
      )

      onLogin()
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="login-page">
      <div className="glass login-card">
        <h1 className="gradient-text">
          Tokeniser
        </h1>

        <p>
          Intelligent Prompt Optimizer
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button
          className="primary-button"
          onClick={handleLogin}
        >
          Login
        </button>

        <div
          style={{
            marginTop: '20px',
            fontSize: '14px',
          }}
        >
          Demo:
          <br />
          demo@tokeniser.ai
          <br />
          tokeniser123
        </div>
      </div>
    </div>
  )
}