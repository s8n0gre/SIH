const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports');
    
    const email = 'deadborshi@gmail.com';
    const newPassword = 'password123';
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    user.password = newPassword;
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log('Email:', email);
    console.log('New Password:', newPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
