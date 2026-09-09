import Contact from '../models/Contact.js';
import { getIsConnected } from '../config/db.js';

const memoryContacts = [];

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message.',
      });
    }

    if (getIsConnected()) {
      const contact = await Contact.create({
        name,
        email,
        phone: phone || '',
        subject: subject || 'General Inquiry',
        message,
      });
      return res.status(201).json({
        success: true,
        message: 'Thank you for reaching out to Shveraa! Our concierge will respond shortly.',
        data: contact,
      });
    }

    // Fallback store
    const contactEntry = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      createdAt: new Date(),
    };
    memoryContacts.push(contactEntry);

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out to Shveraa! Our concierge will respond shortly.',
      data: contactEntry,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry. Please try again.' });
  }
};
