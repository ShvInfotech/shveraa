import express from 'express';
import {
  AddCategory,
  GetAllCategories,
  GetCategoryById,
  UpdateCategory,
  DeleteCategory,
} from '../../../controllers/admin/v1/categoris.controller.js';
import { checkRole, verifyjwtAccessToken } from '../../../middleware/jwtToken.js';

const router = express.Router();

router.get('/all', GetAllCategories);
router.get('/:id', GetCategoryById);

router.post('/add', verifyjwtAccessToken, checkRole('admin'), AddCategory);
router.put('/update/:id', verifyjwtAccessToken, checkRole('admin'), UpdateCategory);
router.delete('/delete/:id', verifyjwtAccessToken, checkRole('admin'), DeleteCategory);

export default router;