const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const auth = require('../middleware/auth');

// 항공권 검색 라우트
router.post('/search', auth, flightController.searchFlights);

// 항공권 예약 라우트
router.post('/book', auth, flightController.bookFlight);

module.exports = router; 