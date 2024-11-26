const express = require('express');
const router = express.Router();
const File = require('../models/File');

// Q&A 게시판에서 파일 리스트 조회
router.get('/', async (req, res) => {
  try {
    const files = await File.find({}); // 모든 파일 조회
    res.render('Q&A', { files }); // Q&A 템플릿에 파일 리스트 전달
  } catch (error) {
    console.error(error);
    res.render('error', { message: '파일 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
