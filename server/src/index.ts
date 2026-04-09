import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { database } from './infrastructure/database';
import { errorHandler } from './presentation/middleware/ErrorHandler';

import authRoutes from './presentation/routes/authRoutes';
import adminRoutes from './presentation/routes/adminRoutes';
import categoryRoutes from './routes/ecommerce/categoryRoutes';
import colorRoutes from './routes/ecommerce/colorRoutes';
import adminColorRoutes from './routes/ecommerce/adminColorRoutes';
import productRoutes from './routes/ecommerce/productRoutes';
import adminProductRoutes from './routes/ecommerce/adminProductRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/colors', adminColorRoutes);
app.use('/api/admin/products', adminProductRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    await database.initialize();
    console.log('Database connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
