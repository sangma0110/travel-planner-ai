const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const travelPlanRoutes = require('./routes/travelPlans');

dotenv.config();

const app = express();

// CORS 설정
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// OPTIONS 요청 처리
app.options('*', cors(corsOptions));

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 개발 환경에서는 false
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// 미들웨어
app.use(express.json());

// 데이터베이스 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-planner')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/travel-plans', travelPlanRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'AI Travel Planner API' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 