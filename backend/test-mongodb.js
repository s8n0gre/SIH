const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports';

console.log('Testing MongoDB connection...');
console.log('Connection string:', mongoURI);

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  process.exit(0);
})
.catch((error) => {
  console.error('❌ MongoDB Connection Failed!');
  console.error('Error:', error.message);
  console.log('\nPossible solutions:');
  console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
  console.log('2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
  console.log('3. Update MONGODB_URI in backend/.env file');
  process.exit(1);
});
