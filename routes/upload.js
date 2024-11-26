const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/File');

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // 업로드 폴더
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 고유 파일명
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB 제한
});

// AJAX를 통한 파일 업로드
router.post('/', upload.array('file'), async (req, res) => {
  try {
    const { secretKey } = req.body; // 클라이언트에서 비밀키를 전달받음
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: '파일이 업로드되지 않았습니다.' });
    }

    // 각 파일을 데이터베이스에 저장
    const fileDocs = await Promise.all(files.map(file => {
      return new File({
        secretKey: secretKey || null, // 비밀키 저장
        filename: file.filename,
        originalname: file.originalname,
      }).save();
    }));

    res.json({ success: true, files: fileDocs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '파일 업로드 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
