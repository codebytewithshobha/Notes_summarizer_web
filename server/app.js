const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const summarizeRoutes = require('./routes/summarizeRoutes');
const historyRoutes = require('./routes/historyRoutes');
const authRoutes = require('./routes/authRoutes');

const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const sanitizer = require('./middleware/sanitizer');
const cacheMiddleware = require('./middleware/cache');

const app = express();

app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://notessummarizerweb1.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Uncomment after debugging if you want rate limiting
// app.use(rateLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(sanitizer);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', cacheMiddleware(60), historyRoutes);
app.use('/api/summarize', summarizeRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'AI Course Notes Summarizer API is running.',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found.',
  });
});

// Error Handler
app.use(errorHandler);

module.exports = app;
