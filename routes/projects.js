var express = require('express');
var router = express.Router();;
var jwt = require('jsonwebtoken');
var createErrorObj = require('../utils/createErrorObject');
var decodeTokenModule = require('../utils/decodeToken');
var getMongoDb = require('../DBConnection').getMongoDb;
const uuidv4 = require('uuid/v4');


function getProjectsByVendorUserId() {
  const userId = decodeTokenModule.getDecodedToken().userId;
  const collection = getMongoDb().collection("projects");
  return collection.find({ userId }).toArray();
}

function setProject(req) {
  const collection = getMongoDb().collection("projects");
  const userId = decodeTokenModule.getDecodedToken().userId;
  const avatara = req.body.images.filter(img => img.isAvatara === true)[0];
  const images = req.body.images.filter(img => (img.isAvatara === false || img.isAvatara == null));
  let data = {
    id: uuidv4(),
    userId,
    name: req.body.name,
    legalEntityName: req.body.legalEntityName,
    avatara,
    images: images,
    steps: req.body.steps,
    region: req.body.region,
    address: req.body.address,
    description: req.body.description,
    videos: req.body.videos,
    companyAge: req.body.companyAge,
    moneyRequired: req.body.moneyRequired,
    spheresActivity: req.body.spheresActivity
  };
  collection.insertOne(data, function (err, result) {
    if (err) {
      return console.log(err);
    }
  });
}

function updateProjectsByVendorUserId(req) {
  const collection = getMongoDb().collection("projects");
  const userId = decodeTokenModule.getDecodedToken().userId;
  const avatara = req.body.images.filter(img => img.isAvatara === true)[0];
  const images = req.body.images.filter(img => (img.isAvatara === false || img.isAvatara == null));
  let data = {
    id: req.params[0],
    userId,
    name: req.body.name,
    legalEntityName: req.body.legalEntityName,
    avatara,
    images: images,
    steps: req.body.steps,
    region: req.body.region,
    address: req.body.address,
    description: req.body.description,
    videos: req.body.videos,
    companyAge: req.body.companyAge,
    moneyRequired: req.body.moneyRequired,
    spheresActivity: req.body.spheresActivity
  };
  collection.update({ id: req.params[0] }, data, { upsert: false });
}

function removeProjectsById(req) {
  const collection = getMongoDb().collection("projects");
  const userId = decodeTokenModule.getDecodedToken().userId;
  let data = {
    id: req.params[0],
    userId,
  };
  collection.remove(data);
}


function uniqueItems(arr) {
  let result = [];

  for (let elem of arr) {
    if (!result.includes(elem)) {
      result.push(elem);
    }
  }

  return result;
}

async function findByCompanyOrProjectName(name) {
  const collection = getMongoDb().collection("projects");

  if (name === '')
    return [];

  const req1 = collection.find({ name: { $regex: name } }).toArray();
  const req2 = collection.find({ legalEntityName: { $regex: name } }).toArray();

  const res1 = await req1;
  const res2 = await req2;

  const unique = uniqueItems(res1.concat(res2));

  return unique;
}

async function findByFields(req) {
  const collection = getMongoDb().collection("projects");
  const moneyRequiredFrom = parseInt(req.body.moneyRequiredFrom, 10);
  const moneyRequiredTo = parseInt(req.body.moneyRequiredTo, 10);
  const companyAgeFrom = parseInt(req.body.companyAgeFrom, 10);
  const companyAgeTo = parseInt(req.body.companyAgeTo, 10);

  const criterion1 = { moneyRequired: { $gte: moneyRequiredFrom, $lte: moneyRequiredTo } };
  const criterion2 = { companyAge: { $gte: companyAgeFrom, $lte: companyAgeTo } };
  const criterion3 = { region: { $in: req.body.regions } };
  const criterion4 = { spheresActivity: { $in: req.body.spheresActivity } };
  const criterionsArr = [];

  if (isNaN(moneyRequiredFrom) === false && isNaN(moneyRequiredTo) === false)
    criterionsArr.push(criterion1);
  if (isNaN(companyAgeFrom) === false && isNaN(companyAgeTo) === false)
    criterionsArr.push(criterion2);
  if (req.body.regions.length > 0)
    criterionsArr.push(criterion3);
  if (req.body.spheresActivity.length > 0)
    criterionsArr.push(criterion4);

  return collection.find({ $and: criterionsArr }).toArray();
}


async function filteringProjects(req) {
  const result = {};
  let page = req.body.page || 1;
  let pageSize = req.body.pageSize || 5;
  let foundProjects = [];

  if (req.body.projectOrCompanyName != null) {
    foundProjects = await findByCompanyOrProjectName(req.body.projectOrCompanyName);
  } else {
    foundProjects = await findByFields(req);
  }

  const projectsCount = foundProjects.length;
  const pages = Math.ceil(projectsCount / pageSize);
  const projectsList = [];

  const from = page * pageSize - pageSize;
  const to = page * pageSize;
  for (let i = from; i < to; i++) {
    if (foundProjects[i] != null)
      projectsList.push(foundProjects[i])
  }

  result.projectsCount = projectsList.length === 0 ? 0 : projectsCount;
  result.pages = projectsList.length === 0 ? 0 : pages;
  result.projectsList = projectsList;

  return result;
}

router.post('/api/Projects', async (req, res, next) => {
  try {
    await setProject(req);
    res.send('Success')
  } catch (err) {
    res.status(400).send(createErrorObj(0, err));
  }
});

router.get('/api/Projects', async (req, res) => {
  try {
    const res1 = await getProjectsByVendorUserId();
    res.send(res1)
  } catch (err) {
    res.status(400).send(createErrorObj(0, err));
  }
});

router.put('/api/Projects/*', async (req, res) => {
  try {
    await updateProjectsByVendorUserId(req);
    res.send('Success')
  } catch (err) {
    res.status(400).send(createErrorObj(0, err));
  }
});

router.delete('/api/Projects/*', async (req, res) => {
  try {
    await removeProjectsById(req);
    res.send('Success')
  } catch (err) {
    res.status(400).send(createErrorObj(0, err));
  }
});

router.post('/api/FilteringProjects/Filtering-projects', async (req, res, next) => {
  try {
    const projects = await filteringProjects(req);
    res.send(projects)
  } catch (err) {
    console.log(err);
    res.status(400).send(createErrorObj(0, err));
  }
});

module.exports = router;
