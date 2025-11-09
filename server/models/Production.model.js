import mongoose from 'mongoose';

const productionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Please provide production date'],
    default: Date.now
  },
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: [true, 'Please select a machine']
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: [true, 'Please select a worker']
  },
  taka: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Taka',
    required: [true, 'Please select a taka']
  },
  qualityType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityType',
    required: [true, 'Please select quality type']
  },
  shift: {
    type: String,
    enum: ['Day', 'Night'],
    required: [true, 'Please specify shift']
  },
  metersProduced: {
    type: Number,
    required: [true, 'Please enter meters produced'],
    min: [0, 'Meters cannot be negative']
  },
  ratePerMeter: {
    type: Number,
    required: true
  },
  earnings: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate earnings before saving
productionSchema.pre('save', function(next) {
  this.earnings = this.metersProduced * this.ratePerMeter;
  next();
});

// Index for faster queries
productionSchema.index({ date: 1 });
productionSchema.index({ machine: 1 });
productionSchema.index({ worker: 1 });
productionSchema.index({ shift: 1 });

export default mongoose.model('Production', productionSchema);
