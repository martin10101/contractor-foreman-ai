import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId } = req.query;
    const where: any = { organizationId: user.organizationId };
    if (projectId) where.projectId = String(projectId);
    
    const events = await prisma.event.findMany({
      where,
      include: { project: true },
      orderBy: { startTime: 'asc' },
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { title, description, startTime, endTime, projectId } = req.body;
    
    const data: any = {
      organizationId: user.organizationId,
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    };

    if (projectId) {
      const project = await prisma.project.findFirst({ where: { id: String(projectId), organizationId: user.organizationId } });
      if (!project) return res.status(400).json({ message: 'Invalid projectId' });
      data.project = { connect: { id: projectId } };
    }

    const event = await prisma.event.create({
      data,
      include: { project: true },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'Event',
        entityId: event.id,
        summary: `Created event ${event.title}`,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const { title, description, startTime, endTime, projectId } = req.body;

    const existing = await prisma.event.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Event not found' });
    
    const data: any = {
      title,
      description,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
    };

    if (projectId) {
      const project = await prisma.project.findFirst({ where: { id: String(projectId), organizationId: user.organizationId } });
      if (!project) return res.status(400).json({ message: 'Invalid projectId' });
      data.project = { connect: { id: projectId } };
    } else if (projectId === null) {
      data.project = { disconnect: true };
    }

    const event = await prisma.event.update({
      where: { id: existing.id },
      data,
      include: { project: true },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'UPDATE',
        entityType: 'Event',
        entityId: event.id,
        summary: `Updated event ${event.title}`,
      },
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.event.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    await prisma.event.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'Event',
        entityId: existing.id,
        summary: `Deleted event ${existing.title}`,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event' });
  }
};
