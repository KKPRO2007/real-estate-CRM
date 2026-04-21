import { Router, Response } from 'express'
import db from '../db'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const { status, type, min_price, max_price, search } = req.query
  let query = `SELECT p.*, u.name as agent_name FROM properties p LEFT JOIN users u ON p.assigned_agent = u.id WHERE 1=1`
  const params: any[] = []
  if (status) { query += ` AND p.status = ?`; params.push(status) }
  if (type) { query += ` AND p.type = ?`; params.push(type) }
  if (min_price) { query += ` AND p.price >= ?`; params.push(Number(min_price)) }
  if (max_price) { query += ` AND p.price <= ?`; params.push(Number(max_price)) }
  if (search) { query += ` AND (p.title LIKE ? OR p.location LIKE ?)`; params.push(`%${search}%`, `%${search}%`) }
  query += ` ORDER BY p.created_at DESC`
  const properties = db.prepare(query).all(...params)
  const parsed = (properties as any[]).map(p => ({
    ...p,
    images: p.images ? JSON.parse(p.images) : [],
    amenities: p.amenities ? JSON.parse(p.amenities) : []
  }))
  res.json(parsed)
})

router.get('/stats', authenticate, (_req: AuthRequest, res: Response) => {
  const total = (db.prepare('SELECT COUNT(*) as c FROM properties').get() as any).c
  const available = (db.prepare(`SELECT COUNT(*) as c FROM properties WHERE status='available'`).get() as any).c
  const sold = (db.prepare(`SELECT COUNT(*) as c FROM properties WHERE status='sold'`).get() as any).c
  const byType = db.prepare('SELECT type, COUNT(*) as count FROM properties GROUP BY type').all()
  res.json({ total, available, sold, byType })
})

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const property = db.prepare('SELECT p.*, u.name as agent_name FROM properties p LEFT JOIN users u ON p.assigned_agent = u.id WHERE p.id = ?').get(req.params.id) as any
  if (!property) return res.status(404).json({ error: 'Property not found' })
  property.images = property.images ? JSON.parse(property.images) : []
  property.amenities = property.amenities ? JSON.parse(property.amenities) : []
  res.json(property)
})

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { title, type, location, price, size, amenities, status, assigned_agent, images, lat, lng } = req.body
  if (!title || !location) return res.status(400).json({ error: 'Title and location are required' })
  const result = db.prepare(
    'INSERT INTO properties (title, type, location, price, size, amenities, status, assigned_agent, images, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(title, type, location, price, size, JSON.stringify(amenities || []), status || 'available', assigned_agent || null, JSON.stringify(images || []), lat, lng)
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(result.lastInsertRowid) as any
  property.images = JSON.parse(property.images || '[]')
  property.amenities = JSON.parse(property.amenities || '[]')
  res.status(201).json(property)
})

router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const { title, type, location, price, size, amenities, status, assigned_agent, images, lat, lng } = req.body
  const existing = db.prepare('SELECT id FROM properties WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Property not found' })
  db.prepare(
    'UPDATE properties SET title=?, type=?, location=?, price=?, size=?, amenities=?, status=?, assigned_agent=?, images=?, lat=?, lng=? WHERE id=?'
  ).run(title, type, location, price, size, JSON.stringify(amenities || []), status, assigned_agent, JSON.stringify(images || []), lat, lng, req.params.id)
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id) as any
  property.images = JSON.parse(property.images || '[]')
  property.amenities = JSON.parse(property.amenities || '[]')
  res.json(property)
})

router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT id FROM properties WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Property not found' })
  db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id)
  res.json({ message: 'Property deleted' })
})

export default router