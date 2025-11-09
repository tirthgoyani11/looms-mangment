import mongoose from 'mongoose';

const qualityTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a quality type name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ratePerMeter: {
    type: Number,
    required: [true, 'Please provide rate per meter'],
    min: [0, 'Rate cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('QualityType', qualityTypeSchema);
