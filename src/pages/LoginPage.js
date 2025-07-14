import React, { useState } from 'react';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const LoginPage = ({ functionData }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Check if it's a regular user's first login
      if (user.email !== 'admin@money-tracker.com') {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().isFirstLogin) {
          setIsFirstLogin(true);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(auth.currentUser, formData.newPassword);
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isFirstLogin: false
      });
      setIsFirstLogin(false);
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
        {functionData && (
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2>{functionData.functionName}</h2>
            <p>Date: {functionData.date}</p>
            <p>Host: {functionData.hostName}</p>
            {functionData.hostPhoto && (
              <img 
                src={functionData.hostPhoto} 
                alt="Host" 
                className="host-photo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
        )}

        {!isFirstLogin ? (
          <form onSubmit={handleLogin}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h3>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              <p><strong>Admin Login:</strong> admin@money-tracker.com</p>
              <p><strong>Default Password:</strong> admin123</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Change Password</h3>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
              Please change your password on first login
            </p>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
