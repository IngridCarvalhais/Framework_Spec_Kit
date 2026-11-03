export function PriorityControls({ manual, aiActive, available, hasPendingTasks, busy, loading, onToggleManual, onPrioritize }: {
  manual: boolean
  aiActive: boolean
  available: boolean
  hasPendingTasks: boolean
  busy: boolean
  loading: boolean
  onToggleManual: () => void
  onPrioritize: () => void
}) {
  return (
    <div className="pending-ai">
      <button className="secondary" type="button" aria-pressed={manual} onClick={onToggleManual}>
        {manual ? 'Quitar orden manual' : 'Ordenar manualmente'}
      </button>
      <button type="button" disabled={busy || loading || !available || !hasPendingTasks} aria-busy={busy} onClick={onPrioritize}>
        {busy ? 'Analizando tareas…' : aiActive ? 'Volver a priorizar con IA' : 'Priorizar con IA'}
      </button>
      <span role="status">
        {busy
          ? 'Gemini está analizando las tareas pendientes.'
          : loading
            ? 'Cargando tareas antes de priorizar.'
            : aiActive
              ? 'Ordenadas por relevancia sugerida por IA.'
              : available
                ? hasPendingTasks
                  ? 'Se enviarán títulos y descripciones a Gemini; la prioridad original no se modifica.'
                  : 'No hay tareas pendientes para priorizar.'
                : 'Configura el servicio local de Gemini para activar la priorización.'}
      </span>
    </div>
  )
}
