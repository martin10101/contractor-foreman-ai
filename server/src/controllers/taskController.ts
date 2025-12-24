import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { projectId, jobSiteId, status, assigneeId } = req.query;
    const where: any = {};
    
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
    const { id } = req.params as { id: string };
    const task = await prisma.task.findUnique({
      where: { id },
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
    const { title, description, status, priority, dueDate, projectId, jobSiteId, assigneeId } = req.body;
    
    const data: any = {
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      project: { connect: { id: projectId } },
    };

    if (jobSiteId) {
      data.jobSite = { connect: { id: jobSiteId } };
    }

    if (assigneeId) {
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
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { title, description, status, priority, dueDate, jobSiteId, assigneeId } = req.body;
    
    const data: any = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    if (jobSiteId) {
      data.jobSite = { connect: { id: jobSiteId } };
    } else if (jobSiteId === null) {
      data.jobSite = { disconnect: true };
    }

    if (assigneeId) {
      data.assignee = { connect: { id: assigneeId } };
    } else if (assigneeId === null) {
      data.assignee = { disconnect: true };
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        project: true,
        jobSite: true,
        assignee: true,
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
    const { id } = req.params as { id: string };
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
};
