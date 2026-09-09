'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexWrap: 'wrap',
      }}
      aria-label="Навігація"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span
            key={item.href}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {index > 0 && (
              <ChevronRight
                size={14}
                style={{ color: 'var(--text-muted)', flexShrink: 0 }}
              />
            )}
            {isLast ? (
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text)',
                }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
