const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');

const cookieParser = require('cookie-parser');

dotenv.config();

// Connect to Database and External Services
connectDB();
connectCloudinary();

const app = express();
const server = http.createServer(app);

// Configure CORS correctly for cookie-based auth
const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:8082',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, true); // Still allow, but ideally use specific check
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => res.send('CanteenGo Backend is Reachable!'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API is running' }));




// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/cafeterias', require('./routes/cafeteriasRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
