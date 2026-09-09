'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FAMILY_MEMBERS = ['Світлана', 'Микола', 'Аня', 'Ілля']

export default function SelectNamePage() {
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
        router.push(name === 'Світлана' ? '/welcome' : '/gallery')
      }
    } catch {
      // тихо ігноруємо помилку
    } finally {
      setLoading(false)
    }
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

        </div>
      </div>
    </div>
  )
}
