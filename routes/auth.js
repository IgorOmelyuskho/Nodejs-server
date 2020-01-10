var express = require('express');
var router = express.Router();
var connection = require('../DBConnection').connection;
var jwt = require('jsonwebtoken');
var createErrorObj = require('../utils/createErrorObject');
var decodeTokenModule = require('../utils/decodeToken');
const bcrypt = require('bcrypt-nodejs');
const salt = bcrypt.genSaltSync(10);


function insertToInvestors(req) {
  const email = req.body.email;
  const investorData = req.body.investorData;
  const query = `INSERT INTO new_schema.investors VALUES (null, "${email}", "${investorData}");`;
  return connection.query(query); // connection.query now return Promise
}

function userWithSameEmailExist(req) {
  const email = req.body.email;
  const query = `SELECT email FROM new_schema.users WHERE email = "${email}";`;
  return connection.query(query); // connection.query now return Promise
}

function insertInvestorToUsers(req, userId) {
  const fullName = req.body.fullName;
  const email = req.body.email;
  const password = req.body.password;
  const hash = bcrypt.hashSync(password, salt);
  const query = `INSERT INTO new_schema.users VALUES ("${email}", "${hash}", "${fullName}", "Investor", "${userId}", null);`;
  return connection.query(query); // connection.query now return Promise
}

async function getInvestorByToken() {
  const decoded = decodeTokenModule.getDecodedToken();
  var email;
  if (decoded == null)
    throw '401';
  else
    email = decodeTokenModule.getDecodedToken().email;

  const query1 = `SELECT * FROM new_schema.users WHERE email = "${email}";`;
  const res1 = connection.query(query1); // start now

  const query2 = `SELECT * FROM new_schema.investors WHERE email = "${email}";`;
  const res2 = connection.query(query2); // start now

  const r1 = await res1;
  const r2 = await res2;

  if (r2.length === 0)
    throw `Investor with email '${email}' not exist`;

  return { ...r1[0], ...r2[0] };
}

function getVendorByToken() {
  const decoded = decodeTokenModule.getDecodedToken();
  var email;
  if (decoded == null)
    throw '401';
  else
    email = decodeTokenModule.getDecodedToken().email;

  const query1 = `SELECT * FROM new_schema.users WHERE email = "${email}";`;
  const res1 = connection.query(query1); // start now

  const query2 = `SELECT * FROM new_schema.vendors WHERE email = "${email}";`;
  const res2 = connection.query(query2); // start now

  return new Promise((resolve, reject) => {
    Promise.all([res1, res2])
      .then(result => {
        if (result[1].length === 0) {
          reject(`Vendor with email '${email}' not exist`)
          // throw `Vendor with email '${email}' not exist`; // will need to use .catch in this block
        } else {
          resolve({ ...result[0][0], ...result[1][0] });
        }
      })
  });
}

async function insertVendor(req) {
  const fullName = req.body.fullName;
  const password = req.body.password;
  const hash = bcrypt.hashSync(password, salt);
  const email = req.body.email;
  const vendorData = req.body.vendorData;

  const query = `SELECT email FROM new_schema.users WHERE email = "${email}";`;
  const res = await connection.query(query); // start now
  if (res.length !== 0 && res[0].email === email)
    throw "USER WITH SAME EMAIL ALREADY EXISTS";

  const query1 = `INSERT INTO new_schema.vendors VALUES (null, "${email}", "${vendorData}");`;
  const res1 = await connection.query(query1); // connection.query now return Promise

  const query2 = `INSERT INTO new_schema.users VALUES ("${email}", "${hash}", "${fullName}", "Vendor", "${res1.insertId}", null);`;
  await connection.query(query2); // connection.query now return Promise

  return null;
}

router.post("/api/Auth/authenticate", async (req, res, next) => {
  try {
    const email = req.body.email;
    const query1 = `SELECT email, role, password, userId FROM new_schema.users WHERE email = "${email}";`;
    const res1 = await connection.query(query1);

    if (res1.length === 0)
      throw `User with email ${email} not exist`;

    const hash = res1[0].password;
    const passwordIsCorrect = bcrypt.compareSync(req.body.password, hash);
    if (passwordIsCorrect === false)
      throw "Not correct email or password";

    const token = jwt.sign({
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1h
      role: res1[0].role,
      email,
      userId: res1[0].userId
    }, decodeTokenModule.jwtSecret);

    res.json({ token })
  } catch (err) {
    console.log(err);
    res.status(400).send(createErrorObj(0, err.toString()));
  }
});

router.post('/api/Investor/register', async (req, res, next) => {
  try {
    const res1 = await userWithSameEmailExist(req);
    if (res1.length !== 0 && res1[0].email === req.body.email)
      throw "USER WITH SAME EMAIL ALREADY EXISTS";
    const res2 = await insertToInvestors(req);
    const res3 = await insertInvestorToUsers(req, res2.insertId);
    res.send('Success')
  } catch (err) {
    console.log(err);
    res.status(400).send(err.toString());
  }
});

router.get('/api/Investor', async (req, res) => {
  try {
    const res1 = await getInvestorByToken();
    res.send(res1);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.toString());
  }
});

router.post('/api/Vendor/register', async (req, res, next) => {
  try {
    const res1 = await insertVendor(req);
    res.send('Success')
  } catch (err) {
    res.status(400).send(createErrorObj(0, err));
  }
});

router.get('/api/Vendor', (req, res) => {
  getVendorByToken()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.status(400).send(err.toString());
    })
});

module.exports = router;
