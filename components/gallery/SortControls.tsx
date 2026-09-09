'use client'

export type SortOption = 'newest' | 'oldest' | 'name' | 'author'

interface SortControlsProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Дата (новіші)' },
  { value: 'oldest', label: 'Дата (старіші)' },
  { value: 'name', label: 'Назва' },
  { value: 'author', label: 'Автор' },
]

export default function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
      >
        Сортування:
      </span>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              border: '1px solid var(--border)',
              backgroundColor: value === opt.value ? 'var(--accent)' : 'transparent',
              color: value === opt.value ? 'var(--text)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: value === opt.value ? 500 : 400,
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
