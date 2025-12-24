import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { id?: string; organizationId?: string; role?: string } | undefined;
    if (!user?.id || !user.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const [dbUser, org] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, firstName: true, lastName: true },
      }),
      prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: { id: true, name: true },
      }),
    ]);

    if (!dbUser || !org) return res.status(401).json({ message: 'Session invalid' });

    res.json({
      user: {
        ...dbUser,
        organizationId: org.id,
        role: user.role,
      },
      organization: org,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session' });
  }
};

