'use client'

import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--accent)',
    color: 'var(--text)',
    border: '1px solid transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  danger: {
    backgroundColor: 'transparent',
    color: '#c0392b',
    border: '1px solid #c0392b',
  },
}

const hoverStyles: Record<Variant, React.CSSProperties> = {
  primary: { backgroundColor: '#ddb880' },
  ghost: { backgroundColor: 'var(--surface)' },
  danger: { backgroundColor: '#fdf0ee' },
}

export default function Button({
  variant = 'primary',
  style,
  disabled,
  onMouseEnter,
  onMouseLeave,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s',
        ...styles[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles[variant])
        }
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, styles[variant])
        }
        onMouseLeave?.(e)
      }}
      {...props}
    >
      {children}
    </button>
  )
}
