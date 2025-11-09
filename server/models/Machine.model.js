import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  machineCode: {
    type: String,
    required: [true, 'Please provide a machine code'],
    unique: true,
    trim: true,
    uppercase: true
  },
  machineName: {
    type: String,
    required: [true, 'Please provide a machine name'],
    trim: true
  },
  machineType: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance', 'Broken'],
    default: 'Active'
  },
  installationDate: {
    type: Date
  },
  dayShiftWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  nightShiftWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  },
  currentTaka: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taka'
  },
  location: {
    type: String,
    trim: true
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries (machineCode already indexed by unique: true)
machineSchema.index({ status: 1 });

export default mongoose.model('Machine', machineSchema);
