'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FAMILY_MEMBERS = ['Світлана', 'Микола', 'Аня']

export default function SelectNamePage() {
  const [customName, setCustomName] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function selectName(name: string) {
    if (!name.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (res.ok) {
        router.push('/gallery')
      }
    } catch {
      // тихо ігноруємо помилку
    } finally {
      setLoading(false)
    }
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault()
    selectName(customName)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-semibold tracking-wide mb-1"
            style={{ color: 'var(--text)' }}
          >
            greenkiv
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Хто ти сьогодні?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAMILY_MEMBERS.map((name) => (
            <button
              key={name}
              onClick={() => selectName(name)}
              disabled={loading}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--text)',
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--accent)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--surface)')
              }
            >
              {name}
            </button>
          ))}

          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              disabled={loading}
              style={{
                backgroundColor: 'transparent',
                border: '1px dashed var(--border)',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '15px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              Інший...
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Введіть ваше ім'я"
                autoFocus
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
              <button
                type="submit"
                disabled={loading || !customName.trim()}
                style={{
                  backgroundColor:
                    loading || !customName.trim()
                      ? 'var(--border)'
                      : 'var(--accent)',
                  color: 'var(--text)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: loading || !customName.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                Продовжити
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
