import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

export const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact' });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, role, company, notes } = req.body;
    const contact = await prisma.contact.create({
      data: { firstName, lastName, email, phone, role, company, notes },
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact' });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, role, company, notes } = req.body;
    const contact = await prisma.contact.update({
      where: { id },
      data: { firstName, lastName, email, phone, role, company, notes },
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contact' });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.contact.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact' });
  }
};
