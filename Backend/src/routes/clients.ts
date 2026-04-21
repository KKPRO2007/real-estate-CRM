import { Router, Response } from 'express'
import db from '../db'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const { type, search } = req.query
  let query = `SELECT * FROM clients WHERE 1=1`
  const params: any[] = []
  if (type) { query += ` AND type = ?`; params.push(type) }
  if (search) { query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`) }
  query += ` ORDER BY created_at DESC`
  const clients = db.prepare(query).all(...params)
  const parsed = (clients as any[]).map(c => ({ ...c, preferences: c.preferences ? JSON.parse(c.preferences) : {} }))
  res.json(parsed)
})

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id) as any
  if (!client) return res.status(404).json({ error: 'Client not found' })
  client.preferences = client.preferences ? JSON.parse(client.preferences) : {}
  const interactions = db.prepare('SELECT i.*, u.name as created_by_name FROM interactions i LEFT JOIN users u ON i.created_by = u.id WHERE i.client_id = ? ORDER BY i.created_at DESC').all(req.params.id)
  const deals = db.prepare('SELECT d.*, p.title as property_title FROM deals d LEFT JOIN properties p ON d.property_id = p.id WHERE d.client_id = ? ORDER BY d.created_at DESC').all(req.params.id)
  res.json({ ...client, interactions, deals })
})

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { name, email, phone, type, preferences } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required' })
  const result = db.prepare('INSERT INTO clients (name, email, phone, type, preferences) VALUES (?, ?, ?, ?, ?)').run(name, email, phone, type || 'buyer', JSON.stringify(preferences || {}))
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid) as any
  client.preferences = JSON.parse(client.preferences || '{}')
  res.status(201).json(client)
})

router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { name, email, phone, type, preferences } = req.body
  const existing = db.prepare('SELECT id FROM clients WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Client not found' })
  db.prepare('UPDATE clients SET name=?, email=?, phone=?, type=?, preferences=? WHERE id=?').run(name, email, phone, type, JSON.stringify(preferences || {}), req.params.id)
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id) as any
  client.preferences = JSON.parse(client.preferences || '{}')
  res.json(client)
})

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT id FROM clients WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Client not found' })
  db.prepare('DELETE FROM interactions WHERE client_id = ?').run(req.params.id)
  db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id)
  res.json({ message: 'Client deleted' })
})

router.post('/:id/interactions', authenticate, (req: AuthRequest, res: Response) => {
  const { type, notes } = req.body
  const result = db.prepare('INSERT INTO interactions (client_id, type, notes, created_by) VALUES (?, ?, ?, ?)').run(req.params.id, type, notes, req.user!.id)
  res.status(201).json({ id: result.lastInsertRowid })
})

export default router