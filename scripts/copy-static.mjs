import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const files = [
  ['src/main/preload.cjs', 'dist/main/preload.cjs']
]

for (const [from, to] of files) {
  await mkdir(dirname(join(process.cwd(), to)), { recursive: true })
  await copyFile(join(process.cwd(), from), join(process.cwd(), to))
}
