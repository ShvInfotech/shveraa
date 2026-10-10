import express from 'express';
import { GetContacts, submitContact, updateContactStatus } from '../controllers/contactController.js';
import { checkRole, verifyjwtAccessToken } from '../middleware/jwtToken.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/Inquiry', verifyjwtAccessToken, checkRole('admin'), GetContacts);
router.patch('/Inquiry/:id/status', verifyjwtAccessToken, checkRole('admin'), updateContactStatus);

export default router;

