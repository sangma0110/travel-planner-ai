const User = require('../models/User');

// 이메일 회원가입
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // 새 사용자 생성
    const user = await User.create({
      email,
      password,
      name
    });

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name
    };

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 이메일 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 비밀번호 확인
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name
    };

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Google OAuth 로그인
exports.googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, imageUrl } = req.body;

    // 사용자 찾기 또는 생성
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        imageUrl
      });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user._id,
      googleId: user.googleId,
      email: user.email,
      name: user.name
    };

    res.json({
      success: true,
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 로그아웃
exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ success: true });
}; 