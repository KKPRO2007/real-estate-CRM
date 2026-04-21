import { Router, Response } from 'express'
import db from '../db'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const { status, assigned_to, source, search } = req.query
  let query = `SELECT l.*, u.name as agent_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id WHERE 1=1`
  const params: any[] = []
  if (status) { query += ` AND l.status = ?`; params.push(status) }
  if (assigned_to) { query += ` AND l.assigned_to = ?`; params.push(assigned_to) }
  if (source) { query += ` AND l.source = ?`; params.push(source) }
  if (search) { query += ` AND (l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`) }
  query += ` ORDER BY l.created_at DESC`
  const leads = db.prepare(query).all(...params)
  res.json(leads)
})

router.get('/stats', authenticate, (req: AuthRequest, res: Response) => {
  const total = (db.prepare('SELECT COUNT(*) as c FROM leads').get() as any).c
  const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM leads GROUP BY status').all()
  const bySource = db.prepare('SELECT source, COUNT(*) as count FROM leads GROUP BY source').all()
  const thisWeek = (db.prepare(`SELECT COUNT(*) as c FROM leads WHERE created_at >= datetime('now', '-7 days')`).get() as any).c
  res.json({ total, byStatus, bySource, thisWeek })
})

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const lead = db.prepare('SELECT l.*, u.name as agent_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id WHERE l.id = ?').get(req.params.id)
  if (!lead) return res.status(404).json({ error: 'Lead not found' })
  const interactions = db.prepare('SELECT i.*, u.name as created_by_name FROM interactions i LEFT JOIN users u ON i.created_by = u.id WHERE i.lead_id = ? ORDER BY i.created_at DESC').all(req.params.id)
  const reminders = db.prepare('SELECT * FROM reminders WHERE lead_id = ? ORDER BY due_at ASC').all(req.params.id)
  res.json({ ...lead as any, interactions, reminders })
})

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { name, phone, email, budget, source, status, assigned_to, notes } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required' })
  const result = db.prepare(
    'INSERT INTO leads (name, phone, email, budget, source, status, assigned_to, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, phone, email, budget, source || 'manual', status || 'new', assigned_to || null, notes)
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(lead)
})

router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { name, phone, email, budget, source, status, assigned_to, notes } = req.body
  const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Lead not found' })
  db.prepare(
    'UPDATE leads SET name=?, phone=?, email=?, budget=?, source=?, status=?, assigned_to=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).run(name, phone, email, budget, source, status, assigned_to, notes, req.params.id)
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id)
  res.json(lead)
})

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Lead not found' })
  db.prepare('DELETE FROM interactions WHERE lead_id = ?').run(req.params.id)
  db.prepare('DELETE FROM reminders WHERE lead_id = ?').run(req.params.id)
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id)
  res.json({ message: 'Lead deleted' })
})

router.post('/:id/interactions', authenticate, (req: AuthRequest, res: Response) => {
  const { type, notes } = req.body
  const result = db.prepare('INSERT INTO interactions (lead_id, type, notes, created_by) VALUES (?, ?, ?, ?)').run(req.params.id, type, notes, req.user!.id)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.post('/:id/reminders', authenticate, (req: AuthRequest, res: Response) => {
  const { message, due_at } = req.body
  const result = db.prepare('INSERT INTO reminders (lead_id, agent_id, message, due_at) VALUES (?, ?, ?, ?)').run(req.params.id, req.user!.id, message, due_at)
  res.status(201).json({ id: result.lastInsertRowid })
})

export default router