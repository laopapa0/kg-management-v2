interface DeleteConnectionButtonProps {
  x: number
  y: number
  onClick: () => void
  visible: boolean
}

export default function DeleteConnectionButton({
  x,
  y,
  onClick,
  visible,
}: DeleteConnectionButtonProps) {
  if (!visible) return null

  return (
    <button
      data-testid="delete-connection-button"
      onClick={onClick}
      className="fixed z-50 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg animate-scale-in pointer-events-auto"
      style={{
        left: x - 10,
        top: y - 10,
      }}
      aria-label="删除挂靠"
    >
      ×
    </button>
  )
}
