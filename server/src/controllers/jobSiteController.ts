import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getJobSites = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId } = req.query;
    const where: any = {
      project: { organizationId: user.organizationId },
    };
    if (projectId) where.projectId = String(projectId);
    const jobSites = await prisma.jobSite.findMany({
      where,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobSites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job sites' });
  }
};

export const createJobSite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { name, address, city, state, zipCode, projectId } = req.body;
    const project = await prisma.project.findFirst({ where: { id: String(projectId), organizationId: user.organizationId } });
    if (!project) return res.status(400).json({ message: 'Invalid projectId' });

    const jobSite = await prisma.jobSite.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        project: { connect: { id: projectId } },
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'JobSite',
        entityId: jobSite.id,
        summary: `Created job site ${jobSite.name}`,
      },
    });

    res.status(201).json(jobSite);
  } catch (error) {
    console.error('Create job site error:', error);
    res.status(500).json({ message: 'Error creating job site' });
  }
};

export const updateJobSite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const { name, address, city, state, zipCode } = req.body;

    const existing = await prisma.jobSite.findFirst({
      where: { id, project: { organizationId: user.organizationId } },
    });
    if (!existing) return res.status(404).json({ message: 'Job site not found' });

    const jobSite = await prisma.jobSite.update({
      where: { id: existing.id },
      data: { name, address, city, state, zipCode },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'UPDATE',
        entityType: 'JobSite',
        entityId: jobSite.id,
        summary: `Updated job site ${jobSite.name}`,
      },
    });

    res.json(jobSite);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job site' });
  }
};

export const deleteJobSite = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.jobSite.findFirst({
      where: { id, project: { organizationId: user.organizationId } },
    });
    if (!existing) return res.status(404).json({ message: 'Job site not found' });

    await prisma.jobSite.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'JobSite',
        entityId: existing.id,
        summary: `Deleted job site ${existing.name}`,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job site' });
  }
};
