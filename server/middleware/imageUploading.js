import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = file.fieldname || 'images';
    const uploadPath = path.join(process.cwd(), 'uploads', folderName);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
  },
});

export const UploadImage = multer({ storage: storage });
