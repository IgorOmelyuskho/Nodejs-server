var express = require('express'); // Подключаем express
var app = express();
var auth = require('./routes/auth');
var projects = require('./routes/projects');
var files = require('./routes/files');
const bodyParser = require('body-parser');
const cors = require('cors');
var decodeTokenModule = require('./utils/decodeToken');
var jwt = require('jsonwebtoken');

app.use(cors());
app.options('*', cors());  // enable pre-flight
app.use(bodyParser.json());
app.use(express.static(__dirname + '/uploads'));

app.use(function (req, res, next) { // get auth token
  var decodedToken;
  try {
    const tokenEWithoutBearer = req.headers.authorization.replace('Bearer ', '');
    decodedToken = jwt.verify(tokenEWithoutBearer, decodeTokenModule.jwtSecret);
    decodeTokenModule.setDecodedToken(decodedToken);
    next();
  } catch (e) {
    decodedToken = null;
    decodeTokenModule.setDecodedToken(decodedToken);
    if (
      req.originalUrl === '/auth/api/Vendor/register' ||
      req.originalUrl === '/auth/api/Investor/register' ||
      req.originalUrl === '/auth/api/Auth/authenticate' ||
      req.originalUrl.includes('/uploads')
    ) {
      next();
    } else {
      res.status(401).send('Unauthorized');
    }
  }
});

app.use('/auth', auth);
app.use('/projects', projects);
app.use('/files', files);

global.listener = app.listen(3010);

