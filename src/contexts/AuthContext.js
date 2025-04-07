import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// 백엔드 URL 설정
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 세션에서 사용자 정보 확인
    const checkAuth = async () => {
      try {
        // localStorage에서 토큰 가져오기
        const token = localStorage.getItem('token');
        console.log('Stored token:', token);
        
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/auth/check`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Auth check response:', await response.clone().json());
        
        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated && data.user) {
            setUser({
              ...data.user,
              token: token
            });
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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