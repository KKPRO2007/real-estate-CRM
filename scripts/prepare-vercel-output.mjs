import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourceDir = path.join(root, 'frontend', 'dist')
const targetDir = path.join(root, 'dist')

if (!fs.existsSync(sourceDir)) {
  console.error(`Missing frontend build output at ${sourceDir}`)
  process.exit(1)
}

fs.rmSync(targetDir, { recursive: true, force: true })
fs.cpSync(sourceDir, targetDir, { recursive: true })

console.log(`Prepared Vercel output in ${targetDir}`)
