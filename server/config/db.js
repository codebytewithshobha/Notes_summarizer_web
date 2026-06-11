const mongoose = require('mongoose');

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');
};

module.exports = connectDatabase;
