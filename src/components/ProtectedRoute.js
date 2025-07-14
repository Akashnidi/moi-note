import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, user, adminOnly = false }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.email !== 'admin@money-tracker.com') {
    return <Navigate to="/entry" replace />;
  }

  if (!adminOnly && user.email === 'admin@money-tracker.com') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
