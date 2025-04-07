const express = require('express');
const router = express.Router();
const travelPlanController = require('../controllers/travelPlanController');
const authMiddleware = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// 여행 계획 생성
router.post('/', travelPlanController.createPlan);

// 사용자의 모든 여행 계획 조회
router.get('/', travelPlanController.getUserPlans);

// 특정 여행 계획 조회
router.get('/:id', travelPlanController.getPlan);

// 여행 계획 수정
router.put('/:id', travelPlanController.updatePlan);

// 여행 계획 삭제
router.delete('/:id', travelPlanController.deletePlan);

module.exports = router; 