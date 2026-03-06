'use client'

import { useEffect, useRef } from 'react'

type Props = {
  cellData: string
}

const labels: Record<string, string> = {
  confirmed: 'Confirmed',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
}

export function StatusCell({ cellData }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const row = el.closest('tr')
    if (!row) return

    if (cellData === 'fulfilled') {
      row.style.backgroundColor = 'rgba(34, 197, 94, 0.15)'
    } else if (cellData === 'cancelled') {
      row.style.backgroundColor = 'rgba(156, 163, 175, 0.2)'
      row.style.opacity = '0.6'
    } else {
      row.style.backgroundColor = ''
      row.style.opacity = ''
    }
  }, [cellData])

  return <span ref={ref}>{labels[cellData] ?? cellData}</span>
}
