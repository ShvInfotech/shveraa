import express from 'express';
import { GetUserProducts, GetUserProductById } from '../../../controllers/user/v1/product.controller.js';

const router = express.Router();

router.get('/', GetUserProducts);
router.get('/:idOrSlug', GetUserProductById);

export default router;
