import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'provider';
  dateOfBirth?: string;
  specialization?: string;
  conditions?: string[];
  allergies?: string[];
  medications?: string[];
  providerId?: mongoose.Types.ObjectId;
  patients?: mongoose.Types.ObjectId[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['patient', 'provider'],
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: function() {
      return this.role === 'patient';
    },
  },
  specialization: {
    type: String,
    required: function() {
      return this.role === 'provider';
    },
  },
  conditions: [{
    type: String,
  }],
  allergies: [{
    type: String,
  }],
  medications: [{
    type: String,
  }],
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

export const User = mongoose.model<IUser>('User', userSchema); 