import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { ServiceError } from './errors.js'
import { requestOpenAiScores } from './openai.js'
import { buildPrioritization, validateTaskSnapshot } from './scoring.js'

export function createApp(scoreTasks = requestOpenAiScores) {
  const app = express()
  const allowedOrigins = new Set(
    (process.env.AI_ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )

  app.disable('x-powered-by')
  app.use((request, response, next) => {
    const origin = request.get('origin')
    if (origin && !allowedOrigins.has(origin)) {
      return response.status(403).json({ statusCode: 403, message: 'Origen no permitido.' })
    }
    if (origin) {
      response.setHeader('Access-Control-Allow-Origin', origin)
      response.setHeader('Vary', 'Origin')
      response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    }
    if (request.method === 'OPTIONS') return response.sendStatus(204)
    next()
  })
  app.use(express.json({ limit: '256kb', strict: true }))
  app.use('/v1/', rateLimit({
    windowMs: 60_000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_request, response) => response.status(429).json({
      statusCode: 429,
      message: 'Se alcanzó el límite local de priorizaciones; inténtalo más tarde.',
    }),
  }))

  app.get('/health', (_request, response) => response.json({ status: 'ok' }))

  app.post('/v1/projects/:projectId/tasks/prioritize', async (request, response, next) => {
    try {
      const { projectId } = request.params
      const tasks = validateTaskSnapshot(projectId, request.body?.tasks)
      const referenceTime = new Date()
      if (tasks.length === 0) {
        return response.json(buildPrioritization(projectId, [], { tasks: [] }, referenceTime))
      }
      const semanticResults = await scoreTasks(tasks)
      return response.json(buildPrioritization(projectId, tasks, semanticResults, referenceTime))
    } catch (error) {
      return next(error)
    }
  })

  app.use((error, _request, response, _next) => {
    if (error instanceof ServiceError) {
      return response.status(error.status).json({
        statusCode: error.status,
        message: error.message,
      })
    }
    if (error instanceof SyntaxError && 'body' in error) {
      return response.status(400).json({ statusCode: 400, message: 'El JSON de la solicitud no es válido.' })
    }
    if (error?.type === 'entity.too.large') {
      return response.status(413).json({ statusCode: 413, message: 'La solicitud supera el tamaño permitido.' })
    }
    console.error('Error interno del servicio de priorización.')
    return response.status(500).json({ statusCode: 500, message: 'Error interno del servicio de priorización.' })
  })

  return app
}
