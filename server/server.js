const app = require('./app');
const connectDatabase = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Unable to start server:', error);
  process.exit(1);
});
