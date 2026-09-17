import express from "express";
import UserRoutes from './user/v1/user.routes.js';
import AdminRoutes from './admin/v1/admin.routes.js';
import { UploadImage } from '../middleware/imageUploading.js';
import { UploadFileHandler } from '../controllers/upload.controller.js';

const router = express.Router();

router.use('/user', UserRoutes);
router.use('/admin', AdminRoutes);

router.post('/upload', UploadImage.single('image'), UploadFileHandler);
router.post('/upload/multiple', UploadImage.array('images', 10), UploadFileHandler);

export default router;