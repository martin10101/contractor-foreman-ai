import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getOverviewReport = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const organizationId = user.organizationId;
    const [
      contactsCount,
      projectsCount,
      activeProjectsCount,
      tasksCount,
      openTasksCount,
      estimatesCount,
      invoicesCount,
      openInvoicesCount,
    ] = await Promise.all([
      prisma.contact.count({ where: { organizationId } }),
      prisma.project.count({ where: { organizationId } }),
      prisma.project.count({ where: { organizationId, status: 'In Progress' } }),
      prisma.task.count({ where: { project: { organizationId } } }),
      prisma.task.count({ where: { project: { organizationId }, status: { not: 'Completed' } } }),
      prisma.estimate.count({ where: { organizationId } }),
      prisma.invoice.count({ where: { organizationId } }),
      prisma.invoice.count({
        where: { organizationId, status: { in: ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'OVERDUE'] } },
      }),
    ]);

    const invoices = await prisma.invoice.findMany({
      where: { organizationId },
      select: { total: true, payments: { select: { amount: true } } },
    });

    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaid = invoices.reduce(
      (sum, inv) => sum + inv.payments.reduce((s, p) => s + (p.amount || 0), 0),
      0
    );

    res.json({
      counts: {
        contacts: contactsCount,
        projects: projectsCount,
        activeProjects: activeProjectsCount,
        tasks: tasksCount,
        openTasks: openTasksCount,
        estimates: estimatesCount,
        invoices: invoicesCount,
        openInvoices: openInvoicesCount,
      },
      financials: {
        totalInvoiced,
        totalPaid,
        totalOutstanding: Math.max(0, totalInvoiced - totalPaid),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report' });
  }
};

