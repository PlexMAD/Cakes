import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  component: React.ComponentType;
  role: string;
  userRole: string | null;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, role, userRole }) => {
  const isAuthenticated = !!localStorage.getItem('access_token');

  if (!isAuthenticated) {
    return <Navigate to="/" />; 
  }

  if (userRole === null || userRole !== role) {
    return <Navigate to="/" />;
  }

  return <Component />;
};

export default PrivateRoute;
