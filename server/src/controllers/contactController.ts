import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getContacts = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const contacts = await prisma.contact.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

export const getContactById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const contact = await prisma.contact.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact' });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { firstName, lastName, email, phone, role, company, notes } = req.body;
    const contact = await prisma.contact.create({
      data: { organizationId: user.organizationId, firstName, lastName, email, phone, role, company, notes },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'Contact',
        entityId: contact.id,
        summary: `Created contact ${contact.firstName} ${contact.lastName}`,
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact' });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const { firstName, lastName, email, phone, role, company, notes } = req.body;

    const contact = await prisma.contact.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    const updated = await prisma.contact.update({
      where: { id: contact.id },
      data: { firstName, lastName, email, phone, role, company, notes },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'UPDATE',
        entityType: 'Contact',
        entityId: updated.id,
        summary: `Updated contact ${updated.firstName} ${updated.lastName}`,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact' });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };

    const contact = await prisma.contact.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    await prisma.contact.delete({ where: { id: contact.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'Contact',
        entityId: contact.id,
        summary: `Deleted contact ${contact.firstName} ${contact.lastName}`,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact' });
  }
};
