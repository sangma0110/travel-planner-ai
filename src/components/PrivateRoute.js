import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // 사용자가 로그인하지 않은 경우 로그인 페이지로 리디렉션
    return <Navigate to="/login" />;
  }

  // 사용자가 로그인한 경우 요청된 컴포넌트를 렌더링
  return children;
};

export default PrivateRoute; 