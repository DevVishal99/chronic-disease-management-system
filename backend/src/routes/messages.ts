import express from 'express';
import { auth } from '../middleware/auth';
import { Message } from '../models/Message';
import { User } from '../models/User';

const router = express.Router();

// Get user's messages
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user?._id },
        { receiverId: req.user?._id },
      ],
    })
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .sort({ timestamp: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Verify sender and receiver have appropriate relationship
    if (req.user?.role === 'patient') {
      if (receiver.role !== 'provider' || receiver._id.toString() !== req.user.providerId?.toString()) {
        return res.status(403).json({ message: 'Not authorized to send message to this provider' });
      }
    } else if (req.user?.role === 'provider') {
      if (receiver.role !== 'patient' || !receiver.providerId || receiver.providerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to send message to this patient' });
      }
    }

    const message = new Message({
      senderId: req.user?._id,
      receiverId,
      content,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Mark message as read
router.patch('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify the user is the receiver
    if (message.receiverId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.read = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read' });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify the user is either the sender or receiver
    if (
      message.senderId.toString() !== req.user?._id.toString() &&
      message.receiverId.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.remove();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message' });
  }
});

export default router; 