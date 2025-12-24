import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contacts.js';
import projectRoutes from './routes/projects.js';
import jobSiteRoutes from './routes/jobSites.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import meRoutes from './routes/me.js';
import estimateRoutes from './routes/estimates.js';
import invoiceRoutes from './routes/invoices.js';
import documentRoutes from './routes/documents.js';
import reportRoutes from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/job-sites', jobSiteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/me', meRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
