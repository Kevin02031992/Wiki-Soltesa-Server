const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

const authenticateToken = require('../middleware/authenticateToken');

router.get('/users',  userController.getUsers);

router.get('/role', userController.getRoles);

router.put('/password',  userController.updatePassword);

router.put('/update',  userController.updateUser);

router.post('/new',  userController.createUser);

router.post('/login', userController.login);

module.exports = router;