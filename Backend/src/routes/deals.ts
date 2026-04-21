import { Router, Response } from 'express'
import db from '../db'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const { stage, agent_id } = req.query
  let query = `SELECT d.*, c.name as client_name, p.title as property_title, u.name as agent_name FROM deals d LEFT JOIN clients c ON d.client_id = c.id LEFT JOIN properties p ON d.property_id = p.id LEFT JOIN users u ON d.agent_id = u.id WHERE 1=1`
  const params: any[] = []
  if (stage) { query += ` AND d.stage = ?`; params.push(stage) }
  if (agent_id) { query += ` AND d.agent_id = ?`; params.push(agent_id) }
  query += ` ORDER BY d.updated_at DESC`
  const deals = db.prepare(query).all(...params)
  res.json(deals)
})

router.get('/stats', authenticate, (_req: AuthRequest, res: Response) => {
  const total = (db.prepare('SELECT COUNT(*) as c FROM deals').get() as any).c
  const closed = (db.prepare(`SELECT COUNT(*) as c FROM deals WHERE stage='closed'`).get() as any).c
  const totalRevenue = (db.prepare(`SELECT SUM(value) as s FROM deals WHERE stage='closed'`).get() as any).s || 0
  const totalCommission = (db.prepare(`SELECT SUM(commission) as s FROM deals WHERE stage='closed'`).get() as any).s || 0
  const byStage = db.prepare('SELECT stage, COUNT(*) as count FROM deals GROUP BY stage').all()
  const agentPerf = db.prepare(`SELECT u.name, COUNT(d.id) as deal_count, SUM(d.commission) as total_commission FROM deals d LEFT JOIN users u ON d.agent_id = u.id WHERE d.stage='closed' GROUP BY d.agent_id ORDER BY deal_count DESC`).all()
  res.json({ total, closed, totalRevenue, totalCommission, byStage, agentPerf })
})

router.get('/kanban', authenticate, (_req: AuthRequest, res: Response) => {
  const stages = ['inquiry', 'negotiation', 'agreement', 'closed', 'lost']
  const result: Record<string, any[]> = {}
  for (const stage of stages) {
    result[stage] = db.prepare(`SELECT d.*, c.name as client_name, p.title as property_title, u.name as agent_name FROM deals d LEFT JOIN clients c ON d.client_id = c.id LEFT JOIN properties p ON d.property_id = p.id LEFT JOIN users u ON d.agent_id = u.id WHERE d.stage = ? ORDER BY d.updated_at DESC`).all(stage)
  }
  res.json(result)
})

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const deal = db.prepare(`SELECT d.*, c.name as client_name, p.title as property_title, u.name as agent_name FROM deals d LEFT JOIN clients c ON d.client_id = c.id LEFT JOIN properties p ON d.property_id = p.id LEFT JOIN users u ON d.agent_id = u.id WHERE d.id = ?`).get(req.params.id)
  if (!deal) return res.status(404).json({ error: 'Deal not found' })
  const reminders = db.prepare('SELECT * FROM reminders WHERE deal_id = ? ORDER BY due_at ASC').all(req.params.id)
  res.json({ ...deal as any, reminders })
})

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { title, client_id, property_id, agent_id, stage, value, commission, notes } = req.body
  if (!title) return res.status(400).json({ error: 'Title is required' })
  const result = db.prepare('INSERT INTO deals (title, client_id, property_id, agent_id, stage, value, commission, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(title, client_id, property_id, agent_id || req.user!.id, stage || 'inquiry', value, commission, notes)
  const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(deal)
})

router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { title, client_id, property_id, agent_id, stage, value, commission, notes } = req.body
  const existing = db.prepare('SELECT id FROM deals WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Deal not found' })
  db.prepare('UPDATE deals SET title=?, client_id=?, property_id=?, agent_id=?, stage=?, value=?, commission=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(title, client_id, property_id, agent_id, stage, value, commission, notes, req.params.id)
  const deal = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id)
  res.json(deal)
})

router.patch('/:id/stage', authenticate, (req: AuthRequest, res: Response) => {
  const { stage } = req.body
  const validStages = ['inquiry', 'negotiation', 'agreement', 'closed', 'lost']
  if (!validStages.includes(stage)) return res.status(400).json({ error: 'Invalid stage' })
  db.prepare('UPDATE deals SET stage=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(stage, req.params.id)
  res.json({ message: 'Stage updated' })
})

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT id FROM deals WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Deal not found' })
  db.prepare('DELETE FROM reminders WHERE deal_id = ?').run(req.params.id)
  db.prepare('DELETE FROM deals WHERE id = ?').run(req.params.id)
  res.json({ message: 'Deal deleted' })
})

router.post('/:id/reminders', authenticate, (req: AuthRequest, res: Response) => {
  const { message, due_at } = req.body
  const result = db.prepare('INSERT INTO reminders (deal_id, agent_id, message, due_at) VALUES (?, ?, ?, ?)').run(req.params.id, req.user!.id, message, due_at)
  res.status(201).json({ id: result.lastInsertRowid })
})

export default router