import type { ReactNode } from 'react'

interface ToggleButtonProps {
  pressed: boolean
  /** Fill colour when pressed. */
  tone: 'accent' | 'danger'
  ariaLabel: string
  onClick: () => void
  children: ReactNode
}

export function ToggleButton({ pressed, tone, ariaLabel, onClick, children }: ToggleButtonProps) {
  return (
    <button
      type="button"
      className={`toggle toggle--${tone}`}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
