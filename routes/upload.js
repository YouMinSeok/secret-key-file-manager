const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/File');

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // 업로드 폴더 설정
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName); // 고유 파일명 생성
  },
});

// 파일 확장자 필터
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf']; // 허용 확장자
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('허용되지 않은 파일 형식입니다.'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter, // 파일 필터 적용
  limits: { fileSize: 100 * 1024 * 1024 }, // 파일 크기 제한 (100MB)
});

// AJAX를 통한 파일 업로드
router.post('/', upload.array('file', 10), async (req, res) => {
  try {
    const { secretKey } = req.body; // 비밀키
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: '파일이 업로드되지 않았습니다.' });
    }

    // 각 파일을 데이터베이스에 저장
    const fileDocs = await Promise.all(
      files.map(file => {
        return new File({
          secretKey: secretKey || null, // 비밀키
          filename: file.filename,
          originalname: file.originalname,
          uploadDate: new Date(),
        }).save();
      })
    );

    res.json({ success: true, files: fileDocs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '파일 업로드 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
