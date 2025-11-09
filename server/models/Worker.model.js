import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema({
  workerCode: {
    type: String,
    required: [true, 'Please provide a worker code'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Please provide worker name'],
    trim: true
  },
  workerType: {
    type: String,
    enum: ['Permanent', 'Temporary'],
    required: [true, 'Please specify worker type'],
    default: 'Permanent'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  shift: {
    type: String,
    enum: ['Day', 'Night', 'Both', 'None'],
    default: 'None'
  },
  assignedMachines: [{
    machine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Machine'
    },
    shift: {
      type: String,
      enum: ['Day', 'Night']
    },
    assignedDate: {
      type: Date,
      default: Date.now
    }
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries (workerCode already indexed by unique: true)
workerSchema.index({ workerType: 1 });
workerSchema.index({ shift: 1 });

export default mongoose.model('Worker', workerSchema);
