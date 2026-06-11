const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const summarizeRoutes = require('./routes/summarizeRoutes');
const historyRoutes = require('./routes/historyRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/summarize', summarizeRoutes);
app.use('/api/history', historyRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Course Notes Summarizer API is running.' });
});

app.use(errorHandler);

module.exports = app;
