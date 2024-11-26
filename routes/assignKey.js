// /routes/assignKey.js

const express = require('express');
const router = express.Router();
const File = require('../models/File');

// 비밀키를 파일에 할당
router.post('/', async (req, res) => {
  const { secretKey, fileIds } = req.body;

  if (!secretKey || !fileIds || !Array.isArray(fileIds)) {
    return res.status(400).json({ success: false, message: '비밀키와 파일 ID가 필요합니다.' });
  }

  try {
    // 파일들을 찾아 비밀키를 할당
    const result = await File.updateMany(
      { _id: { $in: fileIds } },
      { secretKey: secretKey }
    );

    res.json({ success: true, message: '비밀키가 파일에 할당되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '비밀키 할당 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
