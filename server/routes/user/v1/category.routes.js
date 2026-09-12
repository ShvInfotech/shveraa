import express from 'express';
import { GetUserCategories } from '../../../controllers/user/v1/category.controller.js';

const router = express.Router();

router.get('/', GetUserCategories);

export default router;
