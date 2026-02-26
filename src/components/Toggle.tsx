interface Props {
  checked: boolean
  onChange: () => void
}

export default function Toggle({ checked, onChange }: Props) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className="flex-shrink-0 transition-colors duration-200"
      style={{
        width: 48,
        height: 28,
        borderRadius: 99,
        background: checked ? 'var(--ink)' : 'var(--line)',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
          display: 'block',
        }}
      />
    </button>
  )
}
