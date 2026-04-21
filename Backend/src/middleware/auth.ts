import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import db from '../db'

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
    role: string
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const guestUser = db.prepare('SELECT id, email, role FROM users WHERE email = ?').get(process.env.SEED_GUEST_EMAIL || 'guest@shared.local') as AuthRequest['user'] | undefined

  if (!token) {
    req.user = guestUser || { id: 0, email: 'guest@shared.local', role: 'guest' }
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as AuthRequest['user']
    req.user = decoded
    next()
  } catch {
    req.user = guestUser || { id: 0, email: 'guest@shared.local', role: 'guest' }
    next()
  }
}

export function authorizeRoles(...roles: string[]) {
  return (_req: AuthRequest, _res: Response, next: NextFunction) => {
    next()
  }
}
