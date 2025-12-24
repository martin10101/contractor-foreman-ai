import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { formatSequenceNumber } from '../lib/numbers.js';
import PDFDocument from 'pdfkit';

const recalcInvoiceTotalsAndStatus = async (invoiceId: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { lineItems: true, payments: true },
  });
  if (!invoice) return null;

  const subtotal = invoice.lineItems.reduce((sum, li) => sum + (li.total || 0), 0);
  const taxAmount = subtotal * (invoice.taxRate || 0);
  const total = subtotal + taxAmount;
  const paid = invoice.payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  let status = invoice.status;
  if (status !== 'VOID') {
    if (paid <= 0 && status === 'DRAFT') {
      status = 'DRAFT';
    } else if (paid > 0 && paid < total) {
      status = 'PARTIALLY_PAID';
    } else if (total > 0 && paid >= total) {
      status = 'PAID';
    }
  }

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { subtotal, taxAmount, total, status },
  });
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId, status } = req.query;
    const where: any = { organizationId: user.organizationId };
    if (projectId) where.projectId = String(projectId);
    if (status) where.status = String(status);

    const invoices = await prisma.invoice.findMany({
      where,
      include: { project: true, estimate: true, lineItems: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { project: true, estimate: true, lineItems: true, payments: true },
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { projectId, estimateId, number, issueDate, dueDate, taxRate, notes, lineItems } = req.body;
    const project = await prisma.project.findFirst({ where: { id: String(projectId), organizationId: user.organizationId } });
    if (!project) return res.status(400).json({ message: 'Invalid projectId' });

    let estimate: { id: string } | null = null;
    if (estimateId) {
      estimate = await prisma.estimate.findFirst({ where: { id: String(estimateId), organizationId: user.organizationId } });
      if (!estimate) return res.status(400).json({ message: 'Invalid estimateId' });
    }

    const seq = await prisma.invoice.count({ where: { organizationId: user.organizationId } });
    const finalNumber = typeof number === 'string' && number.trim() ? number.trim() : formatSequenceNumber('INV', seq + 1);

    const created = await prisma.invoice.create({
      data: {
        organizationId: user.organizationId,
        projectId: project.id,
        estimateId: estimate?.id ?? null,
        number: finalNumber,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        taxRate: typeof taxRate === 'number' ? taxRate : 0,
        notes,
        ...(Array.isArray(lineItems)
          ? {
              lineItems: {
                create: lineItems.map((li: any) => ({
                  description: String(li.description || '').trim() || 'Line item',
                  quantity: Number(li.quantity ?? 1),
                  unitPrice: Number(li.unitPrice ?? 0),
                  total: Number(li.total ?? Number(li.quantity ?? 1) * Number(li.unitPrice ?? 0)),
                })),
              },
            }
          : {}),
      },
      include: { project: true, estimate: true, lineItems: true, payments: true },
    });

    await recalcInvoiceTotalsAndStatus(created.id);

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'Invoice',
        entityId: created.id,
        summary: `Created invoice ${created.number}`,
      },
    });

    const refreshed = await prisma.invoice.findUnique({
      where: { id: created.id },
      include: { project: true, estimate: true, lineItems: true, payments: true },
    });

    res.status(201).json(refreshed);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice' });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.invoice.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Invoice not found' });

    const { status, dueDate, issueDate, taxRate, notes } = req.body;
    const updated = await prisma.invoice.update({
      where: { id: existing.id },
      data: {
        ...(status === undefined ? {} : { status }),
        ...(dueDate === undefined ? {} : { dueDate: dueDate === null ? null : new Date(dueDate) }),
        ...(issueDate === undefined ? {} : { issueDate: new Date(issueDate) }),
        ...(typeof taxRate === 'number' ? { taxRate } : {}),
        ...(notes === undefined ? {} : { notes }),
      },
      include: { project: true, estimate: true, lineItems: true, payments: true },
    });

    await recalcInvoiceTotalsAndStatus(updated.id);

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'UPDATE',
        entityType: 'Invoice',
        entityId: updated.id,
        summary: `Updated invoice ${updated.number}`,
      },
    });

    const refreshed = await prisma.invoice.findUnique({
      where: { id: updated.id },
      include: { project: true, estimate: true, lineItems: true, payments: true },
    });
    res.json(refreshed);
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice' });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.invoice.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Invoice not found' });

    await prisma.invoice.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'DELETE',
        entityType: 'Invoice',
        entityId: existing.id,
        summary: `Deleted invoice ${existing.number}`,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice' });
  }
};

export const addInvoicePayment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { invoiceId } = req.params as { invoiceId: string };
    const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, organizationId: user.organizationId } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const { amount, method, paidAt, notes } = req.body;
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: Number(amount),
        method: method || 'OTHER',
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        notes,
      },
    });

    await recalcInvoiceTotalsAndStatus(invoice.id);

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'CREATE',
        entityType: 'Payment',
        entityId: payment.id,
        summary: `Recorded payment on ${invoice.number}`,
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error recording payment' });
  }
};

export const markInvoiceSent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string; id?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const existing = await prisma.invoice.findFirst({ where: { id, organizationId: user.organizationId } });
    if (!existing) return res.status(404).json({ message: 'Invoice not found' });

    const updated = await prisma.invoice.update({
      where: { id: existing.id },
      data: { status: 'SENT' },
      include: { project: true, estimate: true, lineItems: true, payments: true },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: user.id ?? null,
        action: 'SEND',
        entityType: 'Invoice',
        entityId: updated.id,
        summary: `Marked invoice ${updated.number} as sent`,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error sending invoice' });
  }
};

export const getInvoicePdf = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { organizationId?: string } | undefined;
    if (!user?.organizationId) return res.status(401).json({ message: 'Authentication required' });

    const { id } = req.params as { id: string };
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId: user.organizationId },
      include: { project: true, estimate: true, lineItems: true, payments: true },
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.number}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).text('Invoice', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Invoice #: ${invoice.number}`);
    doc.text(`Project: ${invoice.project?.name || '—'}`);
    doc.text(`Status: ${invoice.status}`);
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`);
    if (invoice.dueDate) doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
    doc.moveDown();

    doc.fontSize(12).text('Line Items', { underline: true });
    doc.moveDown(0.5);
    invoice.lineItems.forEach((li) => {
      doc
        .fontSize(10)
        .text(
          `${li.description}  |  qty ${li.quantity}  x  $${li.unitPrice.toFixed(2)}  =  $${li.total.toFixed(2)}`
        );
    });
    doc.moveDown();

    doc.fontSize(12).text(`Subtotal: $${(invoice.subtotal || 0).toFixed(2)}`, { align: 'right' });
    doc.text(`Tax: $${(invoice.taxAmount || 0).toFixed(2)}`, { align: 'right' });
    doc.fontSize(14).text(`Total: $${(invoice.total || 0).toFixed(2)}`, { align: 'right' });

    const paid = (invoice.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Paid: $${paid.toFixed(2)}`, { align: 'right' });
    doc.text(`Balance: $${Math.max(0, (invoice.total || 0) - paid).toFixed(2)}`, { align: 'right' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Error generating PDF' });
  }
};
