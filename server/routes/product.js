const express = require("express");
// router : express에서 제공해줌
const router = express.Router();
const multer = require("multer");

//=================================
//             Product
//=================================

var storage = multer.diskStorage({
  // destination : 어디에 파일이 저장되는지
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

var upload = multer({ storage: storage }).single("file");

router.post("/image", (req, res) => {
  // 가져온 이미지를 저장 해주면 된다. 그 때 필요한 라이브러리가 multer
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.json({
      success: true,
      filePath: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

module.exports = router;
