const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const serviceCenterRoutes = require('./routes/serviceCenterRoutes');
const mechanicRoutes = require('./routes/mechanicRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const serviceRecordRoutes = require('./routes/serviceRecordRoutes');
const partRoutes = require('./routes/partRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dbmsQueryRoutes = require('./routes/dbmsQueryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow development frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in dev
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check API
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'UP',
      database: 'CONNECTED',
      serverTime: new Date(),
      system: 'Vehicle Service & Maintenance Management System'
    });
  } catch (err) {
    return res.status(500).json({
      status: 'DEGRADED',
      database: 'DISCONNECTED',
      error: err.message
    });
  }
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-centers', serviceCenterRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/service-records', serviceRecordRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dbms-queries', dbmsQueryRoutes);

// Centralized Error Handling
app.use(errorHandler);


if (process.env.VERCEL !== "1") {
  app.listen(process.env.PORT || 5000, () => console.log("running"));
}

module.exports = app; 