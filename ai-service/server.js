import { createApp } from './src/app.js'
const port = Number(process.env.AI_PORT || 3001)
createApp().listen(port, '127.0.0.1', () => {
  console.log(`Servicio local de priorización escuchando en http://127.0.0.1:${port}`)
})
