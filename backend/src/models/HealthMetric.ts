import mongoose from 'mongoose';

export interface IHealthMetric extends mongoose.Document {
  patientId: mongoose.Types.ObjectId;
  type: 'bloodSugar' | 'bloodPressure' | 'weight';
  value: number;
  unit: string;
  notes?: string;
  timestamp: Date;
}

const healthMetricSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['bloodSugar', 'bloodPressure', 'weight'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
healthMetricSchema.index({ patientId: 1, type: 1, timestamp: -1 });

export const HealthMetric = mongoose.model<IHealthMetric>('HealthMetric', healthMetricSchema); 