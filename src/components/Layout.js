import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const Layout = ({ children, user, functionData }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div>
            <Link to="/">Home</Link>
            {user && user.email !== 'admin@money-tracker.com' && (
              <>
                <Link to="/entry">Money Entry</Link>
                <Link to="/records">Edit Records</Link>
              </>
            )}
            {user && user.email === 'admin@money-tracker.com' && (
              <Link to="/admin">Admin Portal</Link>
            )}
          </div>
          <div>
            {user && (
              <>
                <span style={{ color: 'white', marginRight: '15px' }}>
                  Welcome, {user.email === 'admin@money-tracker.com' ? 'Admin' : user.email}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {functionData && (
        <div className="header">
          <h1>{functionData.functionName}</h1>
          <p>Date: {functionData.date}</p>
          <p>Host: {functionData.hostName}</p>
        </div>
      )}

      <div className="container">
        {children}
      </div>
    </div>
  );
};

export default Layout;
