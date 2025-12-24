import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { formatSequenceNumber } from '../lib/numbers.js';

export const getChangeOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId, status } = req.query;
    const where: any = { organizationId: user.organizationId };
    if (projectId) where.projectId = String(projectId);
    if (status) where.status = String(status);

    const orders = await prisma.changeOrder.findMany({
      where,
      include: { project: true, requestedByUser: true, approvedByUser: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching change orders' });
  }
};

export const createChangeOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId, number, title, description, amount, status } = req.body;
    const project = await prisma.project.findFirst({ where: { id: String(projectId), organizationId: user.organizationId } });
    if (!project) return res.status(400).json({ message: 'Invalid projectId' });

    const seq = await prisma.changeOrder.count({ where: { organizationId: user.organizationId } });
    const finalNumber = typeof number === 'string' && number.trim() ? number.trim() : formatSequenceNumber('CO', seq + 1);

    const created = await prisma.changeOrder.create({
      data: {
        organizationId: user.organizationId,
        projectId: project.id,
        number: finalNumber,
        title: String(title || '').trim() || 'Change Order',
        description,
        amount: Number(amount || 0),
        status: status || 'DRAFT',
        requestedByUserId: user.id ?? null,
      },
      include: { project: true, requestedByUser: true, approvedByUser: true },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'ChangeOrder',
        entityId: created.id,
        summary: `Created change order ${created.number}`,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Error creating change order' });
  }
};

export const updateChangeOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.changeOrder.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Change order not found' });

    const { title, description, amount, status } = req.body;

    const next: any = {
      ...(title === undefined ? {} : { title }),
      ...(description === undefined ? {} : { description }),
      ...(amount === undefined ? {} : { amount: Number(amount) }),
      ...(status === undefined ? {} : { status }),
    };

    if (status === 'APPROVED') {
      next.approvedAt = new Date();
      next.approvedByUserId = user.id ?? null;
    }

    const updated = await prisma.changeOrder.update({
      where: { id: existing.id },
      data: next,
      include: { project: true, requestedByUser: true, approvedByUser: true },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'UPDATE',
        entityType: 'ChangeOrder',
        entityId: updated.id,
        summary: `Updated change order ${updated.number}`,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating change order' });
  }
};

export const deleteChangeOrder = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.changeOrder.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Change order not found' });

    await prisma.changeOrder.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'ChangeOrder',
        entityId: existing.id,
        summary: `Deleted change order ${existing.number}`,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting change order' });
  }
};

