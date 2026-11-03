import type { TaskFilters as Filters, TaskPriority, TaskStatus } from '../../types/api'

export function TaskFilters({ filters, onChange, onClear }: {
  filters: Filters
  onChange: (filters: Filters) => void
  onClear: () => void
}) {
  return (
    <div className="filters" aria-label="Filtros de tareas">
      <div className="field">
        <label htmlFor="filter-status">Estado</label>
        <select id="filter-status" value={filters.status ?? ''} onChange={(event) => onChange({ ...filters, status: (event.target.value || undefined) as TaskStatus | undefined })}>
          <option value="">Todos</option>
          <option value="TODO">Pendiente</option>
          <option value="IN_PROGRESS">En curso</option>
          <option value="DONE">Terminada</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="filter-priority">Prioridad</label>
        <select id="filter-priority" value={filters.priority ?? ''} onChange={(event) => onChange({ ...filters, priority: (event.target.value || undefined) as TaskPriority | undefined })}>
          <option value="">Todas</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </select>
      </div>
      <button className="secondary" type="button" onClick={onClear} disabled={!filters.status && !filters.priority}>Limpiar filtros</button>
    </div>
  )
}
