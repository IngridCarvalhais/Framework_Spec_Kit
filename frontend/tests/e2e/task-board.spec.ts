import { expect, test } from '@playwright/test'

test('demo board supports create, filters, and AI ranking controls', async ({ page }) => {
  await page.route('http://127.0.0.1:3001/v1/projects/demo-project/tasks/prioritize', async (route) => {
    const { tasks } = route.request().postDataJSON() as { tasks: Array<{ id: string }> }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        project_id: 'demo-project',
        reference_time: new Date().toISOString(),
        scoring_version: 'v1',
        tasks: tasks.map(({ id }) => ({ id, ai_score: 0.82, reason: 'Prioridad y contexto considerados.' })),
      }),
    })
  })
  await page.goto('/')
  await expect(page.getByText(/modo demostración/i)).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Tablero de tareas' })).toBeVisible()
  await page.getByRole('button', { name: 'Crear tarea' }).click()
  await page.getByLabel(/Título/).fill('Tarea E2E')
  await page.getByRole('button', { name: 'Crear tarea' }).last().click()
  await expect(page.getByRole('heading', { name: 'Tarea E2E' })).toBeVisible()
  await page.getByLabel('Prioridad').selectOption('MEDIUM')
  await expect(page.getByRole('heading', { name: 'Tarea E2E' })).toBeVisible()
  await page.getByRole('button', { name: 'Priorizar con IA' }).click()
  await expect(page.getByText(/Se actualizaron las sugerencias de prioridad/)).toBeVisible()
})

test('API mode uses MSW explicitly as a mock, not a real backend', async ({ page }) => {
  await page.goto('http://127.0.0.1:4174')
  await page.getByLabel('Correo electrónico').fill('demo@example.test')
  await page.getByLabel('Contraseña').fill('not-a-real-password')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await expect(page.getByRole('heading', { name: 'Tablero de tareas' })).toBeVisible()
  await page.getByRole('button', { name: 'Crear tarea' }).click()
  await page.getByLabel(/Título/).fill('API simulada')
  await page.getByRole('button', { name: 'Crear tarea' }).last().click()
  await expect(page.getByRole('heading', { name: 'API simulada' })).toBeVisible()
})
