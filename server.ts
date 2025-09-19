import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import supplierRoutes from './routes/suppliers';
import productRoutes from './routes/products';
import transactionRoutes from './routes/transactions';
import dashboardRoutes from './routes/dashboard';
import investorRoutes from './routes/investors';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/investors', investorRoutes);

// Basic route
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to POS System API' });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Simple monthly scheduler: run at server start and then check hourly for the first day
  scheduleMonthlyInvestorEmail();
}); 

function scheduleMonthlyInvestorEmail() {
  let lastNotifiedMonth: number | null = null;
  const checkAndRun = () => {
    const now = new Date();
    const isFirstDay = now.getDate() === 1;
    const monthKey = now.getFullYear() * 100 + now.getMonth();
    if (isFirstDay && monthKey !== lastNotifiedMonth) {
      // Placeholder: integrate real email sending here
      console.log('[Investors] Monthly notification job triggered', now.toISOString());
      lastNotifiedMonth = monthKey;
    }
  };
  // Run on start and then hourly
  checkAndRun();
  setInterval(checkAndRun, 60 * 60 * 1000);
}