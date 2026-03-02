const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  address: { type: String },

  // Organisational references (stored as String IDs for ServiceNow compatibility)
  wardId: { type: String },
  zoneId: { type: String },
  municipalityId: { type: String },
  departmentId: { type: String },

  role: {
    type: String,
    enum: ['citizen', 'department_admin', 'system_admin'],
    default: 'citizen'
  },
  permissions: [{ type: String }], // Glide List

  isApproved: {
    type: Boolean,
    default: function () {
      return this.role === 'citizen';
    }
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },

  // Reputation
  reputationPoints: { type: Number, default: 0 },
  badges: [{ type: String }], // Glide List
  level: {
    type: String,
    enum: ['Citizen', 'Contributor', 'Champion', 'Leader'],
    default: 'Citizen'
  },

  // Security
  lastLoginAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  mfaEnabled: { type: Boolean, default: false },

  // Profile
  profileImageUrl: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);