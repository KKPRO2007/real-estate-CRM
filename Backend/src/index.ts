import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth'
import leadRoutes from './routes/leads'
import propertyRoutes from './routes/properties'
import clientRoutes from './routes/clients'
import dealRoutes from './routes/deals'
import agentRoutes from './routes/agents'

dotenv.config()

process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/deals', dealRoutes)
app.use('/api/agents', agentRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

const entryFile = process.argv[1] ? fileURLToPath(import.meta.url) : ''

if (entryFile && process.argv[1] === entryFile) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

export default app
