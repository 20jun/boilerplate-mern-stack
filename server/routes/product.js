const express = require("express");
// router : express에서 제공해줌
const router = express.Router();
const multer = require("multer");
const { Product } = require("../models/Product");

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

router.post("/", (req, res) => {
  // 받아온 정보들를 DB에 저장한다.
  const product = new Product(req.body);

  product.save((err) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

router.post("/products", (req, res) => {
  // product collection에 들어 있는 모든 상품 정보를 가져오기

  console.log("products req : ", req.body);
  let limit = req.body.limit ? parseInt(req.body.limit) : 20;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let term = req.body.searchTerm;

  console.log("term : ", term);
  let findArgs = {};

  // key : continent, price
  for (let key in req.body.filters) {
    // 하나 이상 들어가 있으면
    if (req.body.filters[key].length > 0) {
      console.log("key", key);

      if (key === "price") {
        findArgs[key] = {
          // mongoDB에서 사용
          // gte : 이것보다 크거나 같고(Greater than equal)
          $gte: req.body.filters[key][0],
          // lte : 이것보다 작거나 같고(Less than equal)
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  // Product.find()
  //   .populate("writer")
  //   .skip(skip)
  //   .limit(limit)
  //   .exec((err, productInfo) => {
  //     if (err) return res.status(400).json({ success: false, err });
  //     return res
  //       .status(200)
  //       .json({ success: true, productInfo, postSize: productInfo.length });
  //   });

  console.log("findArgs : ", findArgs);

  // 검색 단어가 있는지 없는지
  if (term) {
    Product.find(findArgs)
      // .find({ $text: { $search: term } })
      .find({ title: { $regex: term } })
      .populate("writer")
      .skip(skip)
      .limit(limit)
      .exec((err, productInfo) => {
        if (err) return res.status(400).json({ success: false, err });

        Product.find()
          .skip(skip + limit)
          .limit(limit)
          .exec((err, next) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({
              success: true,
              productInfo,
              postSize: productInfo.length,
              next: next.length === 0,
            });
          });
      });
  } else {
    // findArgs(continent)에 맞는 데이터만 가지고 와라
    Product.find(findArgs)
      .populate("writer")
      .skip(skip)
      .limit(limit)
      .exec((err, productInfo) => {
        if (err) return res.status(400).json({ success: false, err });

        Product.find()
          .skip(skip + limit)
          .limit(limit)
          .exec((err, next) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({
              success: true,
              productInfo,
              postSize: productInfo.length,
              next: next.length === 0,
            });
          });
      });
  }
});

router.get("/products_by_id", (req, res) => {
  // 쿼리를 이용해서 가져올때는 req.body가 아닌 req.query 이런식으로 가져와야 된다.
  let type = req.query.type;
  // let productIds = req.query.id.split(',');
  let productIds = req.query.id;

  if (type === "array") {
    // id=123123,321321,123213 이거를
    // productIds = ['123123', '321321', '123123'] 이런식으로 바꿔주기
    let ids = req.query.id.split(",");
    productIds = ids.map((item) => {
      return item;
    });
    console.log("ids", ids);
  }

  // productId를 이용해서 DB에서 productId와 같은 상품의 정보를 가져온다.

  Product.find({ _id: { $in: productIds } })
    .populate("writer")
    .exec((err, product) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send(product);
    });
});

module.exports = router;
