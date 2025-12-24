import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { createOpaqueToken, sha256Hex } from '../lib/crypto.js';
import type { OrgRole } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const signToken = (payload: { id: string; email: string; organizationId: string; role: OrgRole }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const listInvites = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const invites = await prisma.invite.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        tokenPreview: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
    });
    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invites' });
  }
};

export const createInvite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { email, role, expiresInDays } = req.body as {
      email?: string;
      role?: OrgRole;
      expiresInDays?: number;
    };

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const effectiveRole = (role || 'MEMBER') as OrgRole;
    const days = Number(expiresInDays ?? 7);
    const expiresAt = new Date(Date.now() + Math.max(1, Math.min(30, days)) * 24 * 60 * 60 * 1000);

    const rawToken = createOpaqueToken();
    const tokenHash = sha256Hex(rawToken);
    const tokenPreview = `${rawToken.slice(0, 6)}…${rawToken.slice(-6)}`;

    const invite = await prisma.invite.create({
      data: {
        organizationId: user.organizationId,
        email: normalizedEmail,
        role: effectiveRole,
        tokenHash,
        tokenPreview,
        expiresAt,
        invitedByUserId: user.id ?? null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        tokenPreview: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'Invite',
        entityId: invite.id,
        summary: `Created invite for ${invite.email} (${invite.role})`,
      },
    });

    res.status(201).json({ invite, token: rawToken });
  } catch (error) {
    res.status(500).json({ message: 'Error creating invite' });
  }
};

export const revokeInvite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const invite = await prisma.invite.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!invite) return res.status(404).json({ message: 'Invite not found' });

    await prisma.invite.delete({ where: { id: invite.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'Invite',
        entityId: invite.id,
        summary: `Revoked invite for ${invite.email}`,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error revoking invite' });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const { token, password, firstName, lastName } = req.body as {
      token?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    };

    const rawToken = String(token || '').trim();
    if (!rawToken) return res.status(400).json({ message: 'Invite token is required' });
    const tokenHash = sha256Hex(rawToken);

    const invite = await prisma.invite.findUnique({ where: { tokenHash } });
    if (!invite) return res.status(400).json({ message: 'Invalid invite token' });
    if (invite.acceptedAt) return res.status(400).json({ message: 'Invite already used' });
    if (invite.expiresAt.getTime() < Date.now()) return res.status(400).json({ message: 'Invite expired' });

    const pw = String(password || '');
    if (pw.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const hashedPassword = await bcrypt.hash(pw, 10);

    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email: invite.email } });
      const user =
        existingUser ||
        (await tx.user.create({
          data: {
            email: invite.email,
            password: hashedPassword,
            firstName: firstName || null,
            lastName: lastName || null,
          },
        }));

      if (existingUser) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            ...(firstName === undefined ? {} : { firstName }),
            ...(lastName === undefined ? {} : { lastName }),
          },
        });
      }

      await tx.membership.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: invite.organizationId } },
        update: { role: invite.role },
        create: { userId: user.id, organizationId: invite.organizationId, role: invite.role },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          organizationId: invite.organizationId,
          actorUserId: user.id,
          action: 'ACCEPT',
          entityType: 'Invite',
          entityId: invite.id,
          summary: `Invite accepted by ${invite.email}`,
        },
      });

      return user;
    });

    const tokenJwt = signToken({
      id: result.id,
      email: result.email,
      organizationId: invite.organizationId,
      role: invite.role,
    });

    res.json({
      token: tokenJwt,
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        organizationId: invite.organizationId,
        role: invite.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting invite' });
  }
};
