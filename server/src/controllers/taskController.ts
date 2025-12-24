import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId, jobSiteId, status, assigneeId } = req.query;
    const where: any = {
      project: { organizationId: user.organizationId },
    };
    
    if (projectId) where.projectId = String(projectId);
    if (jobSiteId) where.jobSiteId = String(jobSiteId);
    if (status) where.status = String(status);
    if (assigneeId) where.assigneeId = String(assigneeId);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
        jobSite: true,
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const task = await prisma.task.findFirst({
      where: { id, project: { organizationId: user.organizationId } },
      include: {
        project: true,
        jobSite: true,
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
      },
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { title, description, status, priority, dueDate, projectId, jobSiteId, assigneeId } = req.body;

    const project = await prisma.project.findFirst({ where: { id: String(projectId), organizationId: user.organizationId } });
    if (!project) return res.status(400).json({ message: 'Invalid projectId' });
    
    const data: any = {
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      project: { connect: { id: projectId } },
    };

    if (jobSiteId) {
      const site = await prisma.jobSite.findFirst({ where: { id: String(jobSiteId), projectId: project.id } });
      if (!site) return res.status(400).json({ message: 'Invalid jobSiteId' });
      data.jobSite = { connect: { id: jobSiteId } };
    }

    if (assigneeId) {
      const membership = await prisma.membership.findFirst({
        where: { organizationId: user.organizationId, userId: String(assigneeId) },
      });
      if (!membership) return res.status(400).json({ message: 'Invalid assigneeId' });
      data.assignee = { connect: { id: assigneeId } };
    }

    const task = await prisma.task.create({
      data,
      include: {
        project: true,
        jobSite: true,
        assignee: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'Task',
        entityId: task.id,
        summary: `Created task ${task.title}`,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const { title, description, status, priority, dueDate, jobSiteId, assigneeId } = req.body;

    const existing = await prisma.task.findFirst({
      where: { id, project: { organizationId: user.organizationId } },
      include: { project: true },
    });
    if (!existing) return res.status(404).json({ message: 'Task not found' });
    
    const data: any = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    if (jobSiteId) {
      const site = await prisma.jobSite.findFirst({ where: { id: String(jobSiteId), projectId: existing.projectId } });
      if (!site) return res.status(400).json({ message: 'Invalid jobSiteId' });
      data.jobSite = { connect: { id: jobSiteId } };
    } else if (jobSiteId === null) {
      data.jobSite = { disconnect: true };
    }

    if (assigneeId) {
      const membership = await prisma.membership.findFirst({
        where: { organizationId: user.organizationId, userId: String(assigneeId) },
      });
      if (!membership) return res.status(400).json({ message: 'Invalid assigneeId' });
      data.assignee = { connect: { id: assigneeId } };
    } else if (assigneeId === null) {
      data.assignee = { disconnect: true };
    }

    const task = await prisma.task.update({
      where: { id: existing.id },
      data,
      include: {
        project: true,
        jobSite: true,
        assignee: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'UPDATE',
        entityType: 'Task',
        entityId: task.id,
        summary: `Updated task ${task.title}`,
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.task.findFirst({
      where: { id, project: { organizationId: user.organizationId } },
      include: { project: true },
    });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    await prisma.task.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'Task',
        entityId: existing.id,
        summary: `Deleted task ${existing.title}`,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
};
