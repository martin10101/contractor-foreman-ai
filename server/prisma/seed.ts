import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

const ensure = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.error(`Seed failed during: ${name}`);
    throw error;
  }
};

const main = async () => {
  const org = await ensure('create organization', async () => {
    return prisma.organization.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: { name: 'Fast Build' },
      create: { id: '00000000-0000-0000-0000-000000000001', name: 'Fast Build' },
    });
  });

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await ensure('create admin user', async () => {
    return prisma.user.upsert({
      where: { email: 'admin@fastbuild.local' },
      update: { firstName: 'Admin', lastName: 'User', password: passwordHash },
      create: {
        email: 'admin@fastbuild.local',
        password: passwordHash,
        firstName: 'Admin',
        lastName: 'User',
      },
    });
  });

  await ensure('create membership', async () => {
    await prisma.membership.upsert({
      where: {
        userId_organizationId: { userId: admin.id, organizationId: org.id },
      },
      update: { role: 'OWNER' },
      create: { userId: admin.id, organizationId: org.id, role: 'OWNER' },
    });
  });

  const clientContact = await ensure('create sample contact', async () => {
    return prisma.contact.upsert({
      where: { id: '00000000-0000-0000-0000-000000000101' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000101',
        organizationId: org.id,
        firstName: 'Leiby',
        lastName: 'Appel',
        email: 'leiby@example.com',
        phone: '555-0101',
        role: 'Client',
        company: 'Fast Build',
        notes: 'Seeded sample contact',
      },
    });
  });

  const project = await ensure('create sample project', async () => {
    return prisma.project.upsert({
      where: { id: '00000000-0000-0000-0000-000000000201' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000201',
        organizationId: org.id,
        name: 'Sample Renovation - 123 Main St',
        description: 'Seeded project to demonstrate the system end-to-end.',
        status: 'In Progress',
        clientId: clientContact.id,
      },
      include: { jobSites: true },
    });
  });

  await ensure('create sample job site', async () => {
    await prisma.jobSite.upsert({
      where: { id: '00000000-0000-0000-0000-000000000301' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000301',
        projectId: project.id,
        name: 'Main Job Site',
        address: '123 Main St',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
      },
    });
  });

  await ensure('create sample task', async () => {
    await prisma.task.upsert({
      where: { id: '00000000-0000-0000-0000-000000000401' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000401',
        projectId: project.id,
        title: 'Pour concrete footing',
        description: 'Schedule crew and confirm materials.',
        status: 'In Progress',
        priority: 'High',
        assigneeId: admin.id,
      },
    });
  });

  await ensure('create sample estimate', async () => {
    const estimate = await prisma.estimate.upsert({
      where: { id: '00000000-0000-0000-0000-000000000501' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000501',
        organizationId: org.id,
        projectId: project.id,
        number: 'EST-0001',
        title: 'Foundation Scope',
        status: 'DRAFT',
        taxRate: 0.08875,
      },
    });

    await prisma.estimateLineItem.upsert({
      where: { id: '00000000-0000-0000-0000-000000000511' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000511',
        estimateId: estimate.id,
        description: 'Concrete + labor',
        quantity: 1,
        unitPrice: 12500,
        total: 12500,
      },
    });
  });

  await ensure('audit seed', async () => {
    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        actorUserId: admin.id,
        action: 'SEED',
        entityType: 'system',
        summary: 'Database seeded with demo org/user/project.',
      },
    });
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed complete.');
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    console.error(e);
    process.exit(1);
  });

