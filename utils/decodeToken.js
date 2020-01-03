const jwtSecret = 'secret';
var decodedToken = null;

function getDecodedToken() {
  return decodedToken;
}

function setDecodedToken(decoded) {
  decodedToken = decoded;
}

module.exports = {
  getDecodedToken,
  setDecodedToken,
  jwtSecret
}
