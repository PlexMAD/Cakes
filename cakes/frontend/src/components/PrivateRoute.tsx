import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  component: React.ComponentType;
  role: string;
  userRole: string | null;
  canAccess?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, role, userRole, canAccess }) => {
  const isAuthenticated = !!localStorage.getItem('access_token');

  if (!isAuthenticated) {
    return <Navigate to="/" />; 
  }

  if (userRole === null || userRole !== role || (canAccess === false && userRole === "Заказчик")) {
    return <Navigate to="/" />;
  }

  return <Component />;
};

export default PrivateRoute;
