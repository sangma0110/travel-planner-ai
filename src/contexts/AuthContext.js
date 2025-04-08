import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

// 백엔드 URL 설정
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // JWT 토큰 관리 함수들
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  // 사용자 상태 확인
  const checkAuth = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.isAuthenticated) {
        setUser(data.user);
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 로그인 시 사용자 정보와 토큰 저장
  const updateAuthState = (userData, token) => {
    setUser(userData);
    setToken(token);
  };

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, updateAuthState, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 