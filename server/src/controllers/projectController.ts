import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
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
    const { id } = req.params as { id: string };
    const project = await prisma.project.findUnique({
      where: { id },
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
    const { name, description, status, startDate, endDate, clientId, jobSites } = req.body;
    
    const data: any = {
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    if (clientId) {
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
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, description, status, startDate, endDate, clientId } = req.body;
    
    const data: any = {
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };

    if (clientId) {
      data.client = { connect: { id: clientId } };
    } else if (clientId === null || clientId === '') {
      data.client = { disconnect: true };
    }

    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        client: true,
        jobSites: true,
      }
    });
    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    // Need to handle job sites deletion if not set to cascade in prisma
    // For now, let's assume we want to delete them or Prisma handles it
    await prisma.project.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
};
