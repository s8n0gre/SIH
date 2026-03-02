const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function manageUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports');
    console.log('✅ Connected to MongoDB\n');

    // List all users
    console.log('=== Current Users in Database ===\n');
    const users = await User.find().select('-password');
    
    if (users.length === 0) {
      console.log('No users found in database.\n');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Approved: ${user.isApproved}`);
        console.log(`   Department: ${user.department || 'N/A'}`);
        console.log('');
      });
    }

    // Create test users if none exist
    if (users.length === 0) {
      console.log('Creating default test users...\n');

      // Citizen
      const citizen = new User({
        username: 'citizen',
        email: 'citizen@test.com',
        password: 'password123',
        role: 'citizen'
      });
      await citizen.save();
      console.log('✅ Created: citizen@test.com / password123');

      // Department Admin
      const deptAdmin = new User({
        username: 'dept_admin',
        email: 'dept@test.com',
        password: 'password123',
        role: 'department_admin',
        department: 'Roads & Infrastructure',
        isApproved: true
      });
      await deptAdmin.save();
      console.log('✅ Created: dept@test.com / password123');

      // System Admin
      const sysAdmin = new User({
        username: 'admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'system_admin',
        isApproved: true
      });
      await sysAdmin.save();
      console.log('✅ Created: admin@test.com / password123');

      console.log('\n=== Test Users Created Successfully ===');
    }

    console.log('\n=== Login Credentials ===');
    console.log('Citizen: citizen@test.com / password123');
    console.log('Dept Admin: dept@test.com / password123');
    console.log('System Admin: admin@test.com / password123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

manageUsers();
