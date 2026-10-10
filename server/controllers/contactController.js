import Contact from '../models/Contact.js';

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
      });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry. Please try again.' });
  }
};



export const GetContacts = async (req,res,next)=>{
  try {


    const inquery = await Contact.find().sort({createdAt:-1})
    

    return res.status(200).json({success:true,message:"get inquery",inquery})
  } catch (error) {
    return next(error)
  }
}

// PATCH /api/contact/Inquiry/:id/status — update replied/not_replied status
export const updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['not_replied', 'replied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Use "not_replied" or "replied".' });
    }

    const updated = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    return res.status(200).json({ success: true, message: 'Inquiry status updated.', inquiry: updated });
  } catch (error) {
    return next(error);
  }
};

