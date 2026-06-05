import { readdir, readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'

const root = join(process.cwd(), 'dist', 'main')
const failures = []

for (const file of await listFiles(root)) {
  if (extname(file) !== '.js') continue
  const source = await readFile(file, 'utf8')
  verifyRelativeImportExtensions(file, source)
  verifyNoCommonJsDirname(file, source)
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Packaged main verification passed.')

async function listFiles(dir) {
  const entries = await readdir(dir)
  const files = []
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const entryStat = await stat(fullPath)
    if (entryStat.isDirectory()) {
      files.push(...await listFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  return files
}

function verifyRelativeImportExtensions(file, source) {
  const importPattern = /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1]
    if (!specifier.startsWith('./') && !specifier.startsWith('../')) continue
    if (/\.(?:js|json|node)$/i.test(specifier)) continue
    failures.push(`${file}: relative ESM import must include extension: ${specifier}`)
  }
}

function verifyNoCommonJsDirname(file, source) {
  if (source.includes('__dirname')) {
    failures.push(`${file}: __dirname is not available in ESM packaged main files`)
  }
}
