const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

router.get('/signup', authController.getSignupPage);
router.post('/signup', authController.postSignup);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

module.exports = router;