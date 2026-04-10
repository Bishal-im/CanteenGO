const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');

const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

dotenv.config();

// Connect to Database and External Services
connectDB();
connectCloudinary();

const app = express();
const server = http.createServer(app);

// Security Middlewares
app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

const allowedOrigins = [
    'http://localhost:19006', // Expo Web
    'http://localhost:8081',  // Expo Bundler
    process.env.FRONTEND_URL, // Production Frontend
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => res.send('CanteenGo Backend is Reachable!'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API is running' }));




// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/cafeterias', require('./routes/cafeteriasRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.stack}`);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
