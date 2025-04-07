const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 이메일 회원가입
router.post('/register', authController.register);

// 이메일 로그인
router.post('/login', authController.login);

// Google OAuth 로그인
router.post('/google', authController.googleLogin);

// 로그아웃
router.post('/logout', authController.logout);

module.exports = router; 