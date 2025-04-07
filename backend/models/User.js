const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Google 로그인 사용자는 비밀번호가 필요 없음
    }
  },
  name: {
    type: String,
    required: true
  },
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 비밀번호 해싱
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 검증 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 