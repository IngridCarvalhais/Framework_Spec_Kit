export function LoadingState({ label = 'Cargando tareas…' }: { label?: string }) {
  return <p className="feedback" role="status"><span className="spinner" aria-hidden="true" /> {label}</p>
}
