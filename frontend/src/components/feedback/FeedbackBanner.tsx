import type { ReactNode } from 'react'

export function FeedbackBanner({ kind, children }: { kind: 'error' | 'success' | 'info'; children: ReactNode }) {
  return <div className="feedback" data-kind={kind} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>
}
