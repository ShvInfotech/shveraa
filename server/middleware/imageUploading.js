
import multer from 'multer'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = file.fieldname
    const uploadPath = path.join(__dirname, "../uploads", folderName);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, `src/uploads/${file.fieldname}`)
  },
  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`)
  }
})

export const UploadImage = multer({ storage: storage })




