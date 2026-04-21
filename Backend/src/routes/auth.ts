import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/register', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'Email already registered' })
  const hashed = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hashed, role || 'agent')
  const token = jwt.sign({ id: result.lastInsertRowid, role: role || 'agent', email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, role: role || 'agent' } })
})

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const valid = bcrypt.compareSync(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' })
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user!.id)
  res.json(user)
})

router.get('/agents', authenticate, (req: AuthRequest, res: Response) => {
  const agents = db.prepare('SELECT id, name, email, role FROM users').all()
  res.json(agents)
})

export default router