// /routes/files.js

const express = require('express');
const router = express.Router();
const path = require('path');
const File = require('../models/File');

// 비밀키로 파일 조회
router.post('/', async (req, res) => {
  const searchKey = req.body.searchKey;

  if (!searchKey) {
    return res.render('error', { message: '비밀키를 입력하세요.' });
  }

  const files = await File.find({ secretKey: searchKey });

  if (files.length === 0) {
    return res.render('error', { message: '해당 비밀키로 저장된 파일이 없습니다.' });
  }

  res.render('files', { files: files });
});

// 파일 다운로드 라우트
router.get('/download/:id', async (req, res) => {
  const fileId = req.params.id;
  const file = await File.findById(fileId);

  if (!file) {
    return res.render('error', { message: '파일을 찾을 수 없습니다.' });
  }

  const filePath = path.join(__dirname, '../public/uploads/', file.filename);
  res.download(filePath, file.originalname);
});

module.exports = router;
