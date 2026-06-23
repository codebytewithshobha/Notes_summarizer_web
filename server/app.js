const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const summarizeRoutes = require('./routes/summarizeRoutes');
const historyRoutes = require('./routes/historyRoutes');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const sanitizer = require('./middleware/sanitizer');
const cacheMiddleware = require('./middleware/cache');

const app = express();

app.use(helmet());
app.use(cors());
app.use(rateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizer);

app.use('/api/history', cacheMiddleware(60), historyRoutes);
app.use('/api/summarize', summarizeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Course Notes Summarizer API is running.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use(errorHandler);

module.exports = app;
