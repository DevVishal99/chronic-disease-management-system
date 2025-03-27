import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import { HealthMetric } from '../models/HealthMetric';
import { User } from '../models/User';

const router = express.Router();

// Get patient's health metrics
router.get('/:patientId/metrics', auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    const metrics = await HealthMetric.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching metrics' });
  }
});

// Add new health metric
router.post('/:patientId/metrics', auth, checkRole(['patient']), async (req, res) => {
  try {
    const { patientId } = req.params;
    const { type, value, unit, notes } = req.body;

    // Verify the patient is adding their own metrics
    if (patientId !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const metric = new HealthMetric({
      patientId,
      type,
      value,
      unit,
      notes,
    });

    await metric.save();
    res.status(201).json(metric);
  } catch (error) {
    res.status(500).json({ message: 'Error adding metric' });
  }
});

// Get patient profile
router.get('/:patientId/profile', auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await User.findById(patientId).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Only allow access to own profile or provider
    if (
      patientId !== req.user?._id.toString() &&
      req.user?.role !== 'provider'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update patient profile
router.patch('/:patientId/profile', auth, checkRole(['patient']), async (req, res) => {
  try {
    const { patientId } = req.params;
    const updates = req.body;

    // Verify the patient is updating their own profile
    if (patientId !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const patient = await User.findByIdAndUpdate(
      patientId,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router; 