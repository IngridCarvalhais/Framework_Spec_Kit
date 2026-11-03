import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import openapiTS, { astToString } from 'openapi-typescript'

const frontendRoot = process.cwd()
const contractPath = resolve(frontendRoot, '..', 'Framework con IA', '.spec', 'api', 'openapi-spec.yaml')
const outputPath = resolve(frontendRoot, 'src', 'types', 'openapi.d.ts')

try {
  const contract = await readFile(contractPath, 'utf8')
  const types = await openapiTS(contract)
  await mkdir(resolve(frontendRoot, 'src', 'types'), { recursive: true })
  await writeFile(outputPath, astToString(types), 'utf8')
  console.log(`Tipos OpenAPI generados desde ${contractPath}`)
} catch (error) {
  console.error(`No se pudieron generar los tipos desde ${contractPath}:`, error)
  process.exitCode = 1
}
