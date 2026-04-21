import { Router, Response } from 'express'
import db from '../db'
import { authenticate, authorizeRoles, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, (_req: AuthRequest, res: Response) => {
  const agents = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.created_at,
      COUNT(DISTINCT l.id) as lead_count,
      COUNT(DISTINCT d.id) as deal_count,
      SUM(CASE WHEN d.stage='closed' THEN d.commission ELSE 0 END) as total_commission
    FROM users u
    LEFT JOIN leads l ON l.assigned_to = u.id
    LEFT JOIN deals d ON d.agent_id = u.id
    GROUP BY u.id
    ORDER BY total_commission DESC
  `).all()
  res.json(agents)
})

router.get('/reports/overview', authenticate, (_req: AuthRequest, res: Response) => {
  const leadStats = db.prepare(`SELECT status, COUNT(*) as count FROM leads GROUP BY status`).all()
  const dealStats = db.prepare(`SELECT stage, COUNT(*) as count, SUM(value) as total_value FROM deals GROUP BY stage`).all()
  const monthlyDeals = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count, SUM(value) as revenue
    FROM deals WHERE stage='closed'
    GROUP BY month ORDER BY month DESC LIMIT 12
  `).all()
  const topAgents = db.prepare(`
    SELECT u.name, COUNT(d.id) as deals, SUM(d.commission) as commission
    FROM deals d JOIN users u ON d.agent_id = u.id
    WHERE d.stage='closed'
    GROUP BY d.agent_id ORDER BY deals DESC LIMIT 5
  `).all()
  const propertyStats = db.prepare(`SELECT type, status, COUNT(*) as count FROM properties GROUP BY type, status`).all()
  const conversionRate = (() => {
    const total = (db.prepare('SELECT COUNT(*) as c FROM leads').get() as any).c
    const closed = (db.prepare(`SELECT COUNT(*) as c FROM leads WHERE status='closed'`).get() as any).c
    return total > 0 ? ((closed / total) * 100).toFixed(1) : '0'
  })()
  res.json({ leadStats, dealStats, monthlyDeals, topAgents, propertyStats, conversionRate })
})

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const agent = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.params.id)
  if (!agent) return res.status(404).json({ error: 'Agent not found' })
  const leads = db.prepare('SELECT * FROM leads WHERE assigned_to = ? ORDER BY created_at DESC').all(req.params.id)
  const deals = db.prepare(`SELECT d.*, c.name as client_name, p.title as property_title FROM deals d LEFT JOIN clients c ON d.client_id = c.id LEFT JOIN properties p ON d.property_id = p.id WHERE d.agent_id = ? ORDER BY d.updated_at DESC`).all(req.params.id)
  res.json({ ...agent as any, leads, deals })
})

router.put('/:id', authenticate, authorizeRoles('admin'), (req: AuthRequest, res: Response) => {
  const { name, email, role } = req.body
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Agent not found' })
  db.prepare('UPDATE users SET name=?, email=?, role=? WHERE id=?').run(name, email, role, req.params.id)
  const agent = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.params.id)
  res.json(agent)
})

router.delete('/:id', authenticate, authorizeRoles('admin'), (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Agent not found' })
  db.prepare('UPDATE leads SET assigned_to = NULL WHERE assigned_to = ?').run(req.params.id)
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id)
  res.json({ message: 'Agent deleted' })
})

export default router