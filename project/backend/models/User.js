const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'department_admin', 'system_admin'], 
    default: 'citizen' 
  },
  department: { 
    type: String,
    enum: ['Roads & Infrastructure', 'Water Services', 'Electricity', 'Waste Management', 'Parks & Recreation', 'Public Safety'],
    required: function() { return this.role === 'department_admin'; }
  },
  isApproved: { type: Boolean, default: false },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    avatar: String
  },
  reputation: {
    points: { type: Number, default: 0 },
    badges: [String],
    level: { type: String, default: 'Citizen' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);