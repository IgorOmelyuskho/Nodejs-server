var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var createErrorObj = require('../utils/createErrorObject');
var decodeTokenModule = require('../utils/decodeToken');
const fs = require("fs");
var multer = require('multer')
var upload = multer({ dest: 'uploads/' })
const uuidv4 = require('uuid/v4');





router.post('/api/Upload', upload.any(), (req, res, next) => {
  const resultFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    try {
      const id = uuidv4();
      const fileName = id.toString() + '__' + req.files[i].originalname;
      const fileData = {
        "id": id,
        "url": 'http://localhost:' + global.listener.address().port + '/' + fileName,
        "originalName": req.files[i].originalname
      };
      fs.renameSync(req.files[i].path, 'uploads/' + fileName);
      resultFiles.push(fileData)
    } catch (err) {
      res.status(400).send(createErrorObj(0, err));
      return;
    }
  }
  res.send(resultFiles)
});

module.exports = router;
