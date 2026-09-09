'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WelcomePage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // плавна поява
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Квітка */}
        <div style={{ fontSize: '64px', marginBottom: '24px', lineHeight: 1 }}>
          🌸
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.08em' }}>
          З ДНЕМ НАРОДЖЕННЯ
        </p>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '24px',
            lineHeight: 1.2,
          }}
        >
          Світлана
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            marginBottom: '40px',
          }}
        >
          Цей сайт — невеликий подарунок від нас.<br />
          Тут зберігатимуться найкращі моменти нашої родини — для тебе і разом з тобою.
        </p>

        <button
          onClick={() => router.push('/gallery')}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--text)',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 36px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Відкрити галерею
        </button>
      </div>
    </div>
  )
}
