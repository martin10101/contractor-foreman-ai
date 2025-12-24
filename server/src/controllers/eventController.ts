import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    const where = projectId ? { projectId: String(projectId) } : {};
    
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
    const { title, description, startTime, endTime, projectId } = req.body;
    
    const data: any = {
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    };

    if (projectId) {
      data.project = { connect: { id: projectId } };
    }

    const event = await prisma.event.create({
      data,
      include: { project: true },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { title, description, startTime, endTime, projectId } = req.body;
    
    const data: any = {
      title,
      description,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
    };

    if (projectId) {
      data.project = { connect: { id: projectId } };
    } else if (projectId === null) {
      data.project = { disconnect: true };
    }

    const event = await prisma.event.update({
      where: { id },
      data,
      include: { project: true },
    });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.event.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event' });
  }
};
