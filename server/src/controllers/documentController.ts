import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId, contactId } = req.query;
    const where: any = { organizationId: user.organizationId };
    if (projectId) where.projectId = String(projectId);
    if (contactId) where.contactId = String(contactId);

    const docs = await prisma.document.findMany({
      where,
      include: { project: true, contact: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents' });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { title, kind, url, notes, projectId, contactId } = req.body;

    if (projectId) {
      const project = await prisma.project.findFirst({ where: { id: String(projectId), organizationId: user.organizationId } });
      if (!project) return res.status(400).json({ message: 'Invalid projectId' });
    }

    if (contactId) {
      const contact = await prisma.contact.findFirst({ where: { id: String(contactId), organizationId: user.organizationId } });
      if (!contact) return res.status(400).json({ message: 'Invalid contactId' });
    }

    const doc = await prisma.document.create({
      data: {
        organizationId: user.organizationId,
        title: String(title || '').trim() || 'Untitled document',
        kind,
        url,
        notes,
        projectId: projectId || null,
        contactId: contactId || null,
      },
      include: { project: true, contact: true },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'Document',
        entityId: doc.id,
        summary: `Created document ${doc.title}`,
      },
    });

    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Error creating document' });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.document.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Document not found' });

    await prisma.document.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'Document',
        entityId: existing.id,
        summary: `Deleted document ${existing.title}`,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document' });
  }
};

