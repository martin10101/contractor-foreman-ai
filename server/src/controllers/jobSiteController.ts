import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getJobSites = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const where = projectId ? { projectId: String(projectId) } : {};
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
    const { name, address, city, state, zipCode, projectId } = req.body;
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
    res.status(201).json(jobSite);
  } catch (error) {
    console.error('Create job site error:', error);
    res.status(500).json({ message: 'Error creating job site' });
  }
};

export const updateJobSite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, address, city, state, zipCode } = req.body;
    const jobSite = await prisma.jobSite.update({
      where: { id },
      data: { name, address, city, state, zipCode },
    });
    res.json(jobSite);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job site' });
  }
};

export const deleteJobSite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.jobSite.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job site' });
  }
};
