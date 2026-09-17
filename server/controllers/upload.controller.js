export const UploadFileHandler = (req, res) => {
  if (req.file) {
    const url = `/uploads/${req.file.fieldname}/${req.file.filename}`;
    return res.status(200).json({ success: true, url, file: req.file });
  }
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const urls = req.files.map(f => `/uploads/${f.fieldname}/${f.filename}`);
    return res.status(200).json({ success: true, urls, files: req.files });
  }
  return res.status(400).json({ success: false, message: 'No file provided' });
};
