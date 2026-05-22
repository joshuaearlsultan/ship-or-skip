import type { IdeaMode } from '../../types/request'
import { MODE_DESCRIPTORS } from '../../types/request'

interface ModeTabsProps {
  value: IdeaMode
  onChange: (mode: IdeaMode) => void
  disabled?: boolean
}

export function ModeTabs({ value, onChange, disabled = false }: ModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Evaluation mode"
      className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-1"
    >
      {MODE_DESCRIPTORS.map((mode) => {
        const active = mode.id === value
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(mode.id)}
            className={[
              'rounded-full px-3.5 py-1.5 text-sm transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400',
              active
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900',
              disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            ].join(' ')}
          >
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}
