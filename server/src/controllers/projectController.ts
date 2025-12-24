import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const projects = await prisma.project.findMany({
      where: { organizationId: user.organizationId },
      include: {
        client: true,
        jobSites: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const project = await prisma.project.findFirst({
      where: { id, organizationId: user.organizationId },
      include: {
        client: true,
        jobSites: true,
      },
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { name, description, status, startDate, endDate, clientId, jobSites } = req.body;
    
    const data: any = {
      organizationId: user.organizationId,
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    if (clientId) {
      const contact = await prisma.contact.findFirst({ where: { id: String(clientId), organizationId: user.organizationId } });
      if (!contact) return res.status(400).json({ message: 'Invalid clientId' });
      data.client = { connect: { id: clientId } };
    }

    if (jobSites && Array.isArray(jobSites) && jobSites.length > 0) {
      data.jobSites = { create: jobSites };
    }

    const project = await prisma.project.create({
      data,
      include: {
        client: true,
        jobSites: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'Project',
        entityId: project.id,
        summary: `Created project ${project.name}`,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const { name, description, status, startDate, endDate, clientId } = req.body;
    
    const project = await prisma.project.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const data: any = {
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    if (clientId) {
      const contact = await prisma.contact.findFirst({ where: { id: String(clientId), organizationId: user.organizationId } });
      if (!contact) return res.status(400).json({ message: 'Invalid clientId' });
      data.client = { connect: { id: clientId } };
    } else if (clientId === null || clientId === '') {
      data.client = { disconnect: true };
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data,
      include: {
        client: true,
        jobSites: true,
      }
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'UPDATE',
        entityType: 'Project',
        entityId: updated.id,
        summary: `Updated project ${updated.name}`,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const project = await prisma.project.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await prisma.project.delete({ where: { id: project.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'Project',
        entityId: project.id,
        summary: `Deleted project ${project.name}`,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
};
