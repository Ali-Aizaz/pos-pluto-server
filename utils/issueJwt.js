const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const pathToKey = path.join(__dirname, 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');
const pathToKey2 = path.join(__dirname, 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey2, 'utf8');

const issueJWT = (_id) => {
  const expiresIn = '1d';
  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  const signedToken = jwt.sign(payload, PRIV_KEY, {
    expiresIn,
    algorithm: 'RS256',
  });

  return {
    token: signedToken,
    expires: expiresIn,
  };
};

// const issueRefreshJWT = (user) => {
//   const _id = user.id;
//   const expiresIn = '1y';
//   const payload = {
//     sub: _id,
//     iat: Date.now(),
//   };
//   const signedToken = jwt.sign(payload, Refresh_PRIV_KEY, {
//     expiresIn,
//     algorithm: 'RS256',
//   });

//   return {
//     token: signedToken,
//     expires: expiresIn,
//   };
// };

// const verifyRefreshToken = (token) => {
//   res.json(jwt.verify(req.headers.auth, REFRESH_PUB_KEY));
// };

const verifyToken = (token) => {
  return jwt.verify(token, PUB_KEY);
};

exports.issueJWT = issueJWT;
exports.verifyToken = verifyToken;
// exports.issueRefreshJWT = issueRefreshJWT;
// exports.verifyRefreshToken = verifyRefreshToken;
