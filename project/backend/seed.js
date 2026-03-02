const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
require('dotenv').config();

const demoUsers = [
  // Citizens
  { username: 'rajesh_kumar', email: 'rajesh.kumar@gmail.com', password: 'password123', role: 'citizen' },
  { username: 'priya_singh', email: 'priya.singh@yahoo.com', password: 'password123', role: 'citizen' },
  { username: 'amit_sharma', email: 'amit.sharma@outlook.com', password: 'password123', role: 'citizen' },
  { username: 'sunita_devi', email: 'sunita.devi@gmail.com', password: 'password123', role: 'citizen' },
  { username: 'vikash_yadav', email: 'vikash.yadav@gmail.com', password: 'password123', role: 'citizen' },
  { username: 'kavita_kumari', email: 'kavita.kumari@gmail.com', password: 'password123', role: 'citizen' },
  { username: 'ravi_gupta', email: 'ravi.gupta@gmail.com', password: 'password123', role: 'citizen' },
  { username: 'anita_mishra', email: 'anita.mishra@gmail.com', password: 'password123', role: 'citizen' },
  { username: 'deepak_sahu', email: 'deepak.sahu@gmail.com', password: 'password123', role: 'citizen' },
  { username: 'meera_pandey', email: 'meera.pandey@gmail.com', password: 'password123', role: 'citizen' },
  
  // Department Admins
  { username: 'roads_admin', email: 'roads@jharkhand.gov.in', password: 'admin123', role: 'department_admin', department: 'Roads & Infrastructure', isApproved: true },
  { username: 'water_admin', email: 'water@jharkhand.gov.in', password: 'admin123', role: 'department_admin', department: 'Water Services', isApproved: true },
  { username: 'electricity_admin', email: 'electricity@jharkhand.gov.in', password: 'admin123', role: 'department_admin', department: 'Electricity', isApproved: true },
  { username: 'waste_admin', email: 'waste@jharkhand.gov.in', password: 'admin123', role: 'department_admin', department: 'Waste Management', isApproved: true },
  { username: 'parks_admin', email: 'parks@jharkhand.gov.in', password: 'admin123', role: 'department_admin', department: 'Parks & Recreation', isApproved: true },
  { username: 'safety_admin', email: 'safety@jharkhand.gov.in', password: 'admin123', role: 'department_admin', department: 'Public Safety', isApproved: true },
  
  // System Admins
  { username: 'system_admin', email: 'admin@jharkhand.gov.in', password: 'super123', role: 'system_admin', isApproved: true },
  { username: 'municipal_commissioner', email: 'commissioner@ranchi.gov.in', password: 'super123', role: 'system_admin', isApproved: true }
];

const demoReports = [
  // Roads & Infrastructure
  { title: 'Deep Pothole on Main Road', description: 'Large pothole near City Mall causing vehicle damage', category: 'Roads & Infrastructure', priority: 'urgent', location: { address: 'Main Road, Ranchi, Jharkhand', coordinates: { latitude: 23.3441, longitude: 85.3096 } }, status: 'in_progress', department: 'Roads & Infrastructure', votes: { upvotes: 28, downvotes: 2 } },
  { title: 'Road Crack on NH-33', description: 'Major crack developing on National Highway 33', category: 'Roads & Infrastructure', priority: 'high', location: { address: 'NH-33, Kanke, Ranchi, Jharkhand', coordinates: { latitude: 23.4241, longitude: 85.3196 } }, status: 'open', department: 'Roads & Infrastructure', votes: { upvotes: 22, downvotes: 1 } },
  
  // Water Services
  { title: 'Water Pipe Burst', description: 'Major water pipe burst causing road flooding', category: 'Water Services', priority: 'urgent', location: { address: 'Station Road, Ranchi, Jharkhand', coordinates: { latitude: 23.3569, longitude: 85.3347 } }, status: 'in_progress', department: 'Water Services', votes: { upvotes: 35, downvotes: 1 } },
  { title: 'No Water Supply', description: 'Water supply disrupted for 3 days', category: 'Water Services', priority: 'high', location: { address: 'Ashok Nagar, Ranchi, Jharkhand', coordinates: { latitude: 23.3441, longitude: 85.3096 } }, status: 'assigned', department: 'Water Services', votes: { upvotes: 42, downvotes: 2 } },
  
  // Electricity
  { title: 'Power Outage', description: 'Frequent power cuts affecting entire locality', category: 'Electricity', priority: 'high', location: { address: 'Hindpiri, Ranchi, Jharkhand', coordinates: { latitude: 23.3441, longitude: 85.3096 } }, status: 'open', department: 'Electricity', votes: { upvotes: 45, downvotes: 2 } },
  { title: 'Broken Street Light', description: 'Street light not working for past 2 weeks', category: 'Electricity', priority: 'medium', location: { address: 'Park Road, Ranchi, Jharkhand', coordinates: { latitude: 23.3629, longitude: 85.3346 } }, status: 'assigned', department: 'Electricity', votes: { upvotes: 16, downvotes: 0 } },
  
  // Waste Management
  { title: 'Overflowing Garbage Bins', description: 'Multiple garbage bins overflowing', category: 'Waste Management', priority: 'high', location: { address: 'Market Square, Ranchi, Jharkhand', coordinates: { latitude: 23.3441, longitude: 85.3096 } }, status: 'open', department: 'Waste Management', votes: { upvotes: 24, downvotes: 1 } },
  { title: 'Garbage Not Collected', description: 'Garbage collection missed for 4 days', category: 'Waste Management', priority: 'high', location: { address: 'Kokar, Ranchi, Jharkhand', coordinates: { latitude: 23.3629, longitude: 85.3346 } }, status: 'assigned', department: 'Waste Management', votes: { upvotes: 31, downvotes: 2 } },
  
  // Parks & Recreation
  { title: 'Broken Playground Equipment', description: 'Swing set broken in children park', category: 'Parks & Recreation', priority: 'medium', location: { address: 'Central Park, Ranchi, Jharkhand', coordinates: { latitude: 23.3738, longitude: 85.3360 } }, status: 'assigned', department: 'Parks & Recreation', votes: { upvotes: 15, downvotes: 0 } },
  { title: 'Overgrown Vegetation', description: 'Park vegetation overgrown, blocking walkways', category: 'Parks & Recreation', priority: 'low', location: { address: 'Oxygen Park, Ranchi, Jharkhand', coordinates: { latitude: 23.3629, longitude: 85.3346 } }, status: 'open', department: 'Parks & Recreation', votes: { upvotes: 12, downvotes: 1 } },
  
  // Public Safety
  { title: 'Broken Traffic Signal', description: 'Traffic signal not working causing chaos', category: 'Public Safety', priority: 'urgent', location: { address: 'Albert Ekka Chowk, Ranchi, Jharkhand', coordinates: { latitude: 23.3629, longitude: 85.3346 } }, status: 'in_progress', department: 'Public Safety', votes: { upvotes: 38, downvotes: 1 } },
  { title: 'Missing Manhole Cover', description: 'Open manhole without cover, accident risk', category: 'Public Safety', priority: 'urgent', location: { address: 'Circular Road, Ranchi, Jharkhand', coordinates: { latitude: 23.3569, longitude: 85.3347 } }, status: 'assigned', department: 'Public Safety', votes: { upvotes: 42, downvotes: 0 } }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.create(demoUsers);
    console.log(`Created ${users.length} demo users`);

    // Add reportedBy and timeline to reports
    const reportsWithUsers = demoReports.map((report, index) => {
      const reportedBy = users[Math.floor(Math.random() * 10)]._id; // Random citizen
      const assignedTo = report.status !== 'open' ? users[10 + (index % 6)]._id : null; // Random admin if not open
      
      return {
        ...report,
        reportedBy,
        assignedTo,
        timeline: [
          {
            action: 'Report created',
            user: reportedBy,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            notes: 'Initial report submission'
          },
          ...(report.status !== 'open' ? [{
            action: `Status changed to ${report.status}`,
            user: assignedTo,
            timestamp: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
            notes: `Report ${report.status === 'resolved' ? 'resolved successfully' : 'assigned to department'}`
          }] : [])
        ],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      };
    });

    // Create reports
    const reports = await Report.create(reportsWithUsers);
    console.log(`Created ${reports.length} demo reports`);

    console.log('\n✅ Demo data seeded successfully!');
    console.log('\nDemo Users:');
    console.log('- Citizen: rajesh.kumar@gmail.com / password123');
    console.log('- Roads Admin: roads@jharkhand.gov.in / admin123');
    console.log('- System Admin: admin@jharkhand.gov.in / super123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();