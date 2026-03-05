const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Create system admin
    const adminData = {
      username: 'admin',
      email: 'admin@municipal.gov',
      password: 'admin123',
      role: 'system_admin',
      isApproved: true
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', adminData.email);
      console.log('Username:', existingAdmin.username);
    } else {
      const admin = new User(adminData);
      await admin.save();
      console.log('✅ Admin user created successfully!');
      console.log('Email:', adminData.email);
      console.log('Password:', adminData.password);
      console.log('Username:', adminData.username);
    }

    // Create department admin
    const deptAdminData = {
      username: 'dept_admin',
      email: 'dept@municipal.gov',
      password: 'dept123',
      role: 'department_admin',
      department: 'Roads & Infrastructure',
      isApproved: true
    };

    const existingDept = await User.findOne({ email: deptAdminData.email });
    if (existingDept) {
      console.log('\nDepartment admin already exists');
      console.log('Email:', deptAdminData.email);
    } else {
      const deptAdmin = new User(deptAdminData);
      await deptAdmin.save();
      console.log('\n✅ Department admin created successfully!');
      console.log('Email:', deptAdminData.email);
      console.log('Password:', deptAdminData.password);
      console.log('Department:', deptAdminData.department);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
