import express from 'express';
import {
  AddProduct,
  GetAllProducts,
  GetProductById,
  UpdateProduct,
  DeleteProduct,
} from '../../../controllers/admin/v1/product.controller.js';
import { checkRole, verifyjwtAccessToken } from '../../../middleware/jwtToken.js';

const router = express.Router();

router.get('/all', GetAllProducts);
router.get('/:id', GetProductById);

router.post('/add', verifyjwtAccessToken, checkRole('admin'), AddProduct);
router.put('/update/:id', verifyjwtAccessToken, checkRole('admin'), UpdateProduct);
router.delete('/delete/:id', verifyjwtAccessToken, checkRole('admin'), DeleteProduct);

export default router;
