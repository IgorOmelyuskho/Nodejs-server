function createErrorObj(errCode, errMsg) {
  const errorsArr = [];
  if (Array.isArray(errMsg)) {
    errorsArr = errMsg;
  } else {
    if (typeof errMsg === 'string') {
      errorsArr.push(errMsg);
    } else if (errMsg.hasOwnProperty('sqlMessage')) {
      errorsArr.push(errMsg.sqlMessage);
    } else {
      errorsArr.push(errMsg.toString());
    }
  }

  return {
    "isSuccess": false,
    "error": {
      "code": errCode,
      "errorMessage": errorsArr
    }
  }

}

module.exports = createErrorObj;