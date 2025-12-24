import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import type { OrgRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const signToken = (payload: { id: string; email: string; organizationId: string; role: OrgRole }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, organizationName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const orgName = typeof organizationName === 'string' && organizationName.trim() ? organizationName.trim() : 'My Company';

    const { user, membership } = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: orgName },
      });

      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });

      const createdMembership = await tx.membership.create({
        data: {
          userId: createdUser.id,
          organizationId: organization.id,
          role: 'OWNER',
        },
      });

      return { user: createdUser, membership: createdMembership };
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: membership.organizationId,
        role: membership.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    if (!membership) {
      return res.status(403).json({ message: 'User is not assigned to an organization' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: membership.organizationId,
        role: membership.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const memberships = await prisma.membership.findMany({
      where: { organizationId: user.organizationId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(
      memberships.map((m) => ({
        id: m.user.id,
        email: m.user.email,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        role: m.role,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};
