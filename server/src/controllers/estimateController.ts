import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { formatSequenceNumber } from '../lib/numbers.js';

const recalcEstimateTotals = async (estimateId: string) => {
  const estimate = await prisma.estimate.findUnique({
    where: { id: estimateId },
    include: { lineItems: true },
  });
  if (!estimate) return null;

  const subtotal = estimate.lineItems.reduce((sum, li) => sum + (li.total || 0), 0);
  const taxAmount = subtotal * (estimate.taxRate || 0);
  const total = subtotal + taxAmount;

  return prisma.estimate.update({
    where: { id: estimateId },
    data: { subtotal, taxAmount, total },
  });
};

export const getEstimates = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId, status } = req.query;
    const where: any = { organizationId: user.organizationId };
    if (projectId) where.projectId = String(projectId);
    if (status) where.status = String(status);

    const estimates = await prisma.estimate.findMany({
      where,
      include: { project: true, lineItems: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(estimates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching estimates' });
  }
};

export const getEstimateById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const estimate = await prisma.estimate.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { project: true, lineItems: true },
    });
    if (!estimate) return res.status(404).json({ message: 'Estimate not found' });
    res.json(estimate);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching estimate' });
  }
};

export const createEstimate = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId, number, title, status, taxRate, notes, lineItems } = req.body;
    const project = await prisma.project.findFirst({ where: { id: String(projectId), organizationId: user.organizationId } });
    if (!project) return res.status(400).json({ message: 'Invalid projectId' });

    const seq = await prisma.estimate.count({ where: { organizationId: user.organizationId } });
    const finalNumber = typeof number === 'string' && number.trim() ? number.trim() : formatSequenceNumber('EST', seq + 1);

    const created = await prisma.estimate.create({
      data: {
        organizationId: user.organizationId,
        projectId: project.id,
        number: finalNumber,
        title: typeof title === 'string' && title.trim() ? title.trim() : `Estimate for ${project.name}`,
        status: status || 'DRAFT',
        taxRate: typeof taxRate === 'number' ? taxRate : 0,
        notes,
        ...(Array.isArray(lineItems)
          ? {
              lineItems: {
                create: lineItems.map((li: any) => ({
                  description: String(li.description || '').trim() || 'Line item',
                  quantity: Number(li.quantity ?? 1),
                  unitPrice: Number(li.unitPrice ?? 0),
                  total: Number(li.total ?? Number(li.quantity ?? 1) * Number(li.unitPrice ?? 0)),
                })),
              },
            }
          : {}),
      },
      include: { project: true, lineItems: true },
    });

    await recalcEstimateTotals(created.id);

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'Estimate',
        entityId: created.id,
        summary: `Created estimate ${created.number}`,
      },
    });

    const estimate = await prisma.estimate.findUnique({
      where: { id: created.id },
      include: { project: true, lineItems: true },
    });

    res.status(201).json(estimate);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating estimate' });
  }
};

export const updateEstimate = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.estimate.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Estimate not found' });

    const { title, status, taxRate, notes } = req.body;
    const updated = await prisma.estimate.update({
      where: { id: existing.id },
      data: {
        ...(title === undefined ? {} : { title }),
        ...(status === undefined ? {} : { status }),
        ...(typeof taxRate === 'number' ? { taxRate } : {}),
        ...(notes === undefined ? {} : { notes }),
      },
      include: { project: true, lineItems: true },
    });

    await recalcEstimateTotals(updated.id);

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'UPDATE',
        entityType: 'Estimate',
        entityId: updated.id,
        summary: `Updated estimate ${updated.number}`,
      },
    });

    const refreshed = await prisma.estimate.findUnique({
      where: { id: updated.id },
      include: { project: true, lineItems: true },
    });
    res.json(refreshed);
  } catch (error) {
    res.status(500).json({ message: 'Error updating estimate' });
  }
};

export const deleteEstimate = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.estimate.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Estimate not found' });

    await prisma.estimate.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'Estimate',
        entityId: existing.id,
        summary: `Deleted estimate ${existing.number}`,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting estimate' });
  }
};

export const addEstimateLineItem = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { estimateId } = req.params as { estimateId: string };
    const estimate = await prisma.estimate.findFirst({ where: { id: estimateId, organizationId: user.organizationId } });
    if (!estimate) return res.status(404).json({ message: 'Estimate not found' });

    const { description, quantity, unitPrice } = req.body;
    const qty = Number(quantity ?? 1);
    const price = Number(unitPrice ?? 0);

    const item = await prisma.estimateLineItem.create({
      data: {
        estimateId: estimate.id,
        description: String(description || '').trim() || 'Line item',
        quantity: qty,
        unitPrice: price,
        total: qty * price,
      },
    });

    await recalcEstimateTotals(estimate.id);

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'EstimateLineItem',
        entityId: item.id,
        summary: `Added line item to ${estimate.number}`,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error adding line item' });
  }
};

export const updateEstimateLineItem = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { estimateId, lineItemId } = req.params as { estimateId: string; lineItemId: string };
    const estimate = await prisma.estimate.findFirst({ where: { id: estimateId, organizationId: user.organizationId } });
    if (!estimate) return res.status(404).json({ message: 'Estimate not found' });

    const existing = await prisma.estimateLineItem.findFirst({ where: { id: lineItemId, estimateId: estimate.id } });
    if (!existing) return res.status(404).json({ message: 'Line item not found' });

    const { description, quantity, unitPrice } = req.body;
    const qty = quantity === undefined ? existing.quantity : Number(quantity);
    const price = unitPrice === undefined ? existing.unitPrice : Number(unitPrice);

    const updated = await prisma.estimateLineItem.update({
      where: { id: existing.id },
      data: {
        ...(description === undefined ? {} : { description: String(description || '').trim() || 'Line item' }),
        quantity: qty,
        unitPrice: price,
        total: qty * price,
      },
    });

    await recalcEstimateTotals(estimate.id);

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'UPDATE',
        entityType: 'EstimateLineItem',
        entityId: updated.id,
        summary: `Updated line item on ${estimate.number}`,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating line item' });
  }
};

export const deleteEstimateLineItem = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { estimateId, lineItemId } = req.params as { estimateId: string; lineItemId: string };
    const estimate = await prisma.estimate.findFirst({ where: { id: estimateId, organizationId: user.organizationId } });
    if (!estimate) return res.status(404).json({ message: 'Estimate not found' });

    const existing = await prisma.estimateLineItem.findFirst({ where: { id: lineItemId, estimateId: estimate.id } });
    if (!existing) return res.status(404).json({ message: 'Line item not found' });

    await prisma.estimateLineItem.delete({ where: { id: existing.id } });
    await recalcEstimateTotals(estimate.id);

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'EstimateLineItem',
        entityId: existing.id,
        summary: `Deleted line item from ${estimate.number}`,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting line item' });
  }
};
