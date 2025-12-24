import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { OrgRole } from '@prisma/client';

const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback-secret';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    organizationId: string;
    role: OrgRole;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded?.id || !decoded?.email || !decoded?.organizationId || !decoded?.role) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    req.user = {
      id: String(decoded.id),
      email: String(decoded.email),
      organizationId: String(decoded.organizationId),
      role: decoded.role as OrgRole,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole =
  (allowed: OrgRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
