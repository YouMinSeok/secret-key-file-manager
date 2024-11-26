// /routes/index.js

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // 홈 페이지 렌더링
  res.render('index');
});

module.exports = router;
