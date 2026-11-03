import { describe, expect, it, vi } from 'vitest'
import { createDemoTaskService } from '../../src/services/demo/taskService'

describe('demo task service', () => {
  it('provides all contract statuses and priorities', async () => {
    const service = createDemoTaskService()
    const tasks = await service.listTasks('demo-project')
    expect(new Set(tasks.map((task) => task.status))).toEqual(new Set(['TODO', 'IN_PROGRESS', 'DONE']))
    expect(new Set(tasks.map((task) => task.priority))).toEqual(new Set(['HIGH', 'MEDIUM', 'LOW']))
  })

  it('filters, mutates in memory, and never calls HTTP', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const service = createDemoTaskService()
    const before = await service.listTasks('demo-project')
    const created = await service.createTask({
      project_id: 'demo-project',
      title: 'Prueba manual',
      priority: 'LOW',
    })
    expect((await service.listTasks('demo-project', { priority: 'LOW' })).some((task) => task.id === created.id)).toBe(true)
    await service.updateTask(created.id, { status: 'DONE' })
    await service.deleteTask(created.id)
    expect(await service.listTasks('demo-project')).toHaveLength(before.length)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
