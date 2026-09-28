import express from 'express';
import { checkRole, verifyjwtAccessToken } from '../../../middleware/jwtToken.js';
import { UploadImage } from '../../../middleware/imageUploading.js';
import { AdminGetShopBanners, AddShopBanner, UpdateShopBanner, DeleteShopBanner } from '../../../controllers/admin/v1/shopBanner.controller.js';

const router = express.Router();
router.get('/all', AdminGetShopBanners);
router.post('/add', verifyjwtAccessToken, checkRole('admin'), UploadImage.single('image'), AddShopBanner);
router.put('/update/:id', verifyjwtAccessToken, checkRole('admin'), UploadImage.single('image'), UpdateShopBanner);
router.delete('/delete/:id', verifyjwtAccessToken, checkRole('admin'), DeleteShopBanner);

export default router;
