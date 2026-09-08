const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Connect to database
connectDB();

const app = express();
app.locals.razorpay = razorpay;

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Security middleware
app.use(helmet());

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081'
];

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Non-browser requests (curl, server-to-server)
  if (process.env.NODE_ENV === 'production') {
    return !!process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL;
  }
  return allowedOrigins.includes(origin);
};

const corsOptions = {
  // Disallowed origins resolve to false (no CORS headers, no thrown error)
  origin: (origin, callback) => callback(null, isOriginAllowed(origin)),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Reject requests from disallowed origins with a clean 403 (no stack trace leak)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({ success: false, message: 'Not allowed by CORS' });
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 login attempts per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Body parser middleware with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());

// Routes
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth/customer', require('./routes/customerAuthRoutes'));

// Error handling middleware
app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

async function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
    process.exit(0);
  });
}

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
