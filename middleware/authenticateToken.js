const jwt = require('jsonwebtoken');

const expiryTime = '1h';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, 'asdwda1d8a4sd8w4das8d*w8d*asd@#s', (err, user) => {

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
};

exports.authorization = (userData) => {

  const token = jwt.sign(userData, 'asdwda1d8a4sd8w4das8d*w8d*asd@#s', { expiresIn: expiryTime });

  return token;
};