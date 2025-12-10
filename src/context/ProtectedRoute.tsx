// src/components/ProtectedRoute.tsx
import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

interface Props {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  // const { token } = useAuth();
  // return token ? children : <Navigate to="/login" />;
  return children;
};

export default ProtectedRoute;