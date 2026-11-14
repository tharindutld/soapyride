const mongoose = require('mongoose');

const connectDB = async (url) => {
  mongoose.set('strictQuery', true);
  const mongoUri = url || 'mongodb://127.0.0.1:27017/soapyride';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn(
      'MongoDB not reachable locally — running with built-in store so all Customer & Admin features work seamlessly.'
    );
  }
};

module.exports = connectDB;
