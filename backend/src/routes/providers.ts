import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import { User } from '../models/User';
import { HealthMetric } from '../models/HealthMetric';

const router = express.Router();

// Get provider's patients
router.get('/:providerId/patients', auth, checkRole(['provider']), async (req, res) => {
  try {
    const { providerId } = req.params;

    // Verify the provider is accessing their own patients
    if (providerId !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const provider = await User.findById(providerId).populate('patients', '-password');
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(provider.patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// Assign patient to provider
router.post('/:providerId/patients/:patientId', auth, checkRole(['provider']), async (req, res) => {
  try {
    const { providerId, patientId } = req.params;

    // Verify the provider is assigning to themselves
    if (providerId !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update patient's provider
    const patient = await User.findByIdAndUpdate(
      patientId,
      { providerId },
      { new: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update provider's patients list
    await User.findByIdAndUpdate(
      providerId,
      { $addToSet: { patients: patientId } }
    );

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning patient' });
  }
});

// Remove patient from provider
router.delete('/:providerId/patients/:patientId', auth, checkRole(['provider']), async (req, res) => {
  try {
    const { providerId, patientId } = req.params;

    // Verify the provider is removing from themselves
    if (providerId !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove provider from patient
    await User.findByIdAndUpdate(patientId, { $unset: { providerId: 1 } });

    // Remove patient from provider's list
    await User.findByIdAndUpdate(
      providerId,
      { $pull: { patients: patientId } }
    );

    res.json({ message: 'Patient removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing patient' });
  }
});

// Get provider profile
router.get('/:providerId/profile', auth, async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await User.findById(providerId).select('-password');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Only allow access to own profile or assigned patients
    if (
      providerId !== req.user?._id.toString() &&
      req.user?.role === 'patient' &&
      req.user.providerId?.toString() !== providerId
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update provider profile
router.patch('/:providerId/profile', auth, checkRole(['provider']), async (req, res) => {
  try {
    const { providerId } = req.params;
    const updates = req.body;

    // Verify the provider is updating their own profile
    if (providerId !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const provider = await User.findByIdAndUpdate(
      providerId,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router; 