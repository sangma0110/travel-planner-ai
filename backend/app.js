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
app.use(cors({
  origin: [
    'https://travel-planner-ai-lac.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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
  res.json({ message: 'Travel Planner AI Backend API' });
});

const PORT = process.env.PORT || 5001;

// Vercel 배포를 위한 수정
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; 