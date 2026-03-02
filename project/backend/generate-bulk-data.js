const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
require('dotenv').config();

const locations = [
  { city: 'Ranchi', areas: ['Main Road', 'Station Road', 'Circular Road', 'Harmu Road', 'Kanke Road'] },
  { city: 'Jamshedpur', areas: ['Bistupur', 'Sakchi', 'Kadma', 'Jugsalai', 'Mango'] },
  { city: 'Dhanbad', areas: ['Bank More', 'Hirapur', 'Bartand', 'Jharia', 'Katras'] },
  { city: 'Bokaro', areas: ['Sector 1', 'Sector 4', 'City Centre', 'Thermal', 'Chas'] },
  { city: 'Deoghar', areas: ['Temple Road', 'Station Road', 'Ramtola', 'Rohini', 'Jasidih'] }
];

const departments = ['Roads & Infrastructure', 'Water Services', 'Electricity', 'Waste Management', 'Parks & Recreation', 'Public Safety'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['open', 'assigned', 'in_progress', 'resolved'];

const issueTemplates = {
  'Roads & Infrastructure': [
    { title: 'Pothole on {area}', desc: 'Deep pothole causing vehicle damage' },
    { title: 'Road Crack near {area}', desc: 'Major crack developing on road surface' },
    { title: 'Broken Road Divider', desc: 'Road divider damaged, needs repair' }
  ],
  'Water Services': [
    { title: 'Water Pipe Burst', desc: 'Major water pipe burst causing flooding' },
    { title: 'No Water Supply', desc: 'Water supply disrupted for days' },
    { title: 'Contaminated Water', desc: 'Water supply contaminated' }
  ],
  'Electricity': [
    { title: 'Power Outage', desc: 'Frequent power cuts affecting locality' },
    { title: 'Broken Street Light', desc: 'Street light not working' },
    { title: 'Transformer Issue', desc: 'Transformer making noise and sparking' }
  ],
  'Waste Management': [
    { title: 'Overflowing Garbage Bins', desc: 'Garbage bins overflowing' },
    { title: 'Garbage Not Collected', desc: 'Garbage collection missed for days' },
    { title: 'Illegal Dumping', desc: 'Waste illegally dumped in area' }
  ],
  'Parks & Recreation': [
    { title: 'Broken Playground Equipment', desc: 'Playground equipment broken' },
    { title: 'Overgrown Vegetation', desc: 'Park vegetation overgrown' },
    { title: 'Damaged Park Bench', desc: 'Park benches damaged' }
  ],
  'Public Safety': [
    { title: 'Broken Traffic Signal', desc: 'Traffic signal not working' },
    { title: 'Missing Manhole Cover', desc: 'Open manhole without cover' },
    { title: 'Stray Dog Menace', desc: 'Aggressive stray dogs threatening people' }
  ]
};

const generateCoordinates = () => ({
  latitude: 23.0 + Math.random() * 2,
  longitude: 85.0 + Math.random() * 2
});

const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikash', 'Kavita', 'Ravi', 'Anita'];
const lastNames = ['Kumar', 'Singh', 'Sharma', 'Devi', 'Yadav', 'Kumari', 'Gupta', 'Mishra'];

const generateUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`;
    const email = `${username}@gmail.com`;
    
    users.push({
      username,
      email,
      password: 'password123',
      role: 'citizen'
    });
  }
  return users;
};

const generateReports = (users, count) => {
  const reports = [];
  
  for (let i = 0; i < count; i++) {
    const department = departments[Math.floor(Math.random() * departments.length)];
    const templates = issueTemplates[department];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const area = location.areas[Math.floor(Math.random() * location.areas.length)];
    
    const title = template.title.replace('{area}', area);
    const address = `${area}, ${location.city}, Jharkhand`;
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const reportedBy = users[Math.floor(Math.random() * users.length)]._id;
    
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * daysAgo * 24 * 60 * 60 * 1000);
    
    reports.push({
      title,
      description: template.desc,
      category: department,
      priority,
      location: {
        address,
        coordinates: generateCoordinates()
      },
      status,
      department,
      reportedBy,
      votes: {
        upvotes: Math.floor(Math.random() * 50),
        downvotes: Math.floor(Math.random() * 10)
      },
      timeline: [{
        action: 'Report created',
        user: reportedBy,
        timestamp: createdAt,
        notes: 'Initial report submission'
      }],
      createdAt,
      updatedAt
    });
  }
  
  return reports;
};

async function generateBulkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports');
    console.log('Connected to MongoDB');

    console.log('Generating bulk data...');
    
    const newUsers = generateUsers(200);
    const createdUsers = await User.create(newUsers);
    console.log(`Created ${createdUsers.length} additional users`);
    
    const allUsers = await User.find({ role: 'citizen' });
    
    const newReports = generateReports(allUsers, 500);
    const createdReports = await Report.create(newReports);
    console.log(`Created ${createdReports.length} additional reports`);
    
    const totalUsers = await User.countDocuments();
    const totalReports = await Report.countDocuments();
    
    console.log('\n✅ Bulk data generation complete!');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Reports: ${totalReports}`);
    
    console.log('\nDepartment wise report distribution:');
    for (const dept of departments) {
      const count = await Report.countDocuments({ department: dept });
      console.log(`${dept}: ${count} reports`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Bulk data generation failed:', error);
    process.exit(1);
  }
}

generateBulkData();