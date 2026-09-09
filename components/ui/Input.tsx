'use client'

import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        style={{
          backgroundColor: 'var(--bg)',
          border: `1px solid ${error ? '#c0392b' : 'var(--border)'}`,
          borderRadius: '8px',
          padding: '9px 12px',
          color: 'var(--text)',
          fontSize: '14px',
          outline: 'none',
          width: '100%',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '13px', color: '#c0392b' }}>{error}</span>
      )}
    </div>
  )
}
