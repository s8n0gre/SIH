const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports';

async function testAuth() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Create a test user
    console.log('Test 1: Creating test user...');
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'password123',
      role: 'citizen'
    };

    const user = new User(testUser);
    await user.save();
    console.log('✅ User created:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Approved:', user.isApproved);

    // Test 2: Verify password comparison
    console.log('\nTest 2: Testing password verification...');
    const isMatch = await user.comparePassword('password123');
    console.log('✅ Password match:', isMatch);

    // Test 3: Check database
    console.log('\nTest 3: Checking database...');
    const userCount = await User.countDocuments();
    console.log('✅ Total users in database:', userCount);

    // Cleanup
    await User.findByIdAndDelete(user._id);
    console.log('\n✅ Test user cleaned up');
    console.log('\n=== All tests passed! ===');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuth();
