var express = require('express'); // Подключаем express
var app = express();
var auth = require('./routes/auth');
const bodyParser = require('body-parser');
const cors = require('cors');
var decodeTokenModule = require('./utils/decodeToken');
var jwt = require('jsonwebtoken');

app.use(cors());
app.options('*', cors());  // enable pre-flight
app.use(bodyParser.json());
// app.use(express.static(__dirname + '/public'));

app.use(function (req, res, next) { // get auth token
  var decodedToken;
  try {
    const tokenEWithoutBearer = req.headers.authorization.replace('Bearer ', '');
    decodedToken= jwt.verify(tokenEWithoutBearer, decodeTokenModule.jwtSecret);
    decodeTokenModule.setDecodedToken(decodedToken)
  } catch(e) {
    decodedToken = null;
    decodeTokenModule.setDecodedToken(decodedToken)
  }
  next();
});

app.use('/auth', auth);

app.listen(3010);


