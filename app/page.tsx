'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/select-name')
      } else {
        setError('Невірне кодове слово. Спробуйте ще раз.')
        setPassword('')
      }
    } catch {
      setError('Сталася помилка. Спробуйте ще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-sm"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '40px 36px',
        }}
      >
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-semibold tracking-wide mb-1"
            style={{ color: 'var(--text)' }}
          >
            greenkiv
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Сімейний фотоальбом
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: 'var(--text)' }}
            >
              Кодове слово
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Введіть кодове слово"
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--text)',
                fontSize: '15px',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          {error && (
            <p
              className="text-sm"
              style={{ color: '#c0392b' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              backgroundColor: loading || !password ? 'var(--border)' : 'var(--accent)',
              color: 'var(--text)',
              border: 'none',
              borderRadius: '8px',
              padding: '11px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              marginTop: '4px',
            }}
          >
            {loading ? 'Перевірка...' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  )
}
