import mongoose from 'mongoose';

const takaSchema = new mongoose.Schema({
  takaNumber: {
    type: String,
    required: [true, 'Please provide taka number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: [true, 'Please assign a machine']
  },
  qualityType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityType',
    required: [true, 'Please select quality type']
  },
  totalMeters: {
    type: Number,
    default: 0,
    min: [0, 'Meters cannot be negative']
  },
  targetMeters: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  ratePerMeter: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative']
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate total earnings before saving
takaSchema.pre('save', function(next) {
  this.totalEarnings = this.totalMeters * this.ratePerMeter;
  next();
});

// Index for faster queries (takaNumber already indexed by unique: true)
takaSchema.index({ status: 1 });
takaSchema.index({ machine: 1 });

export default mongoose.model('Taka', takaSchema);
