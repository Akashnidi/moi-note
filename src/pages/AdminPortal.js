import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase/config';

const AdminPortal = ({ functionData, setFunctionData }) => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    email: '',
    password: ''
  });
  const [functionFormData, setFunctionFormData] = useState({
    functionName: '',
    date: '',
    hostName: '',
    hostPhoto: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch users
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    });

    // Initialize function form data
    if (functionData) {
      setFunctionFormData({
        functionName: functionData.functionName || '',
        date: functionData.date || '',
        hostName: functionData.hostName || '',
        hostPhoto: null
      });
    }

    return () => unsubscribe();
  }, [functionData]);

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const password = newUser.password || generateRandomPassword();
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, password);
      
      // Add user to Firestore
      await addDoc(collection(db, 'users'), {
        email: newUser.email,
        uid: userCredential.user.uid,
        isFirstLogin: true,
        createdAt: new Date(),
        initialPassword: password
      });

      setSuccess(`User created successfully! Initial password: ${password}`);
      setNewUser({ email: '', password: '' });
    } catch (error) {
      setError('Error creating user: ' + error.message);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setSuccess('User deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Error deleting user: ' + error.message);
      }
    }
  };

  const handleResetPassword = async (userId, userEmail) => {
    if (window.confirm(`Reset password for user: ${userEmail}?`)) {
      try {
        const newPassword = generateRandomPassword();
        await updateDoc(doc(db, 'users', userId), {
          isFirstLogin: true,
          initialPassword: newPassword
        });
        setSuccess(`Password reset successfully! New password: ${newPassword}`);
        setTimeout(() => setSuccess(''), 5000);
      } catch (error) {
        setError('Error resetting password: ' + error.message);
      }
    }
  };

  const handleFunctionUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let photoUrl = functionData?.hostPhoto || '';
      
      // Upload new photo if selected
      if (functionFormData.hostPhoto) {
        const photoRef = ref(storage, `host-photos/${Date.now()}`);
        await uploadBytes(photoRef, functionFormData.hostPhoto);
        photoUrl = await getDownloadURL(photoRef);
      }

      const updatedFunctionData = {
        functionName: functionFormData.functionName,
        date: functionFormData.date,
        hostName: functionFormData.hostName,
        hostPhoto: photoUrl,
        lastUpdated: new Date()
      };

      // Update function data in Firestore
      await setDoc(doc(db, 'settings', 'functionData'), updatedFunctionData);
      
      // Update local state
      setFunctionData(updatedFunctionData);
      
      setSuccess('Function details updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error updating function details: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{users.length}</p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Function Details Management */}
      <div className="card">
        <h3>Function Details</h3>
        <form onSubmit={handleFunctionUpdate}>
          <div className="form-group">
            <label>Function Name</label>
            <input
              type="text"
              value={functionFormData.functionName}
              onChange={(e) => setFunctionFormData({...functionFormData, functionName: e.target.value})}
              required
              placeholder="Enter function name"
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={functionFormData.date}
              onChange={(e) => setFunctionFormData({...functionFormData, date: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Host Name</label>
            <input
              type="text"
              value={functionFormData.hostName}
              onChange={(e) => setFunctionFormData({...functionFormData, hostName: e.target.value})}
              required
              placeholder="Enter host name"
            />
          </div>

          <div className="form-group">
            <label>Host Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFunctionFormData({...functionFormData, hostPhoto: e.target.files[0]})}
            />
            {functionData?.hostPhoto && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={functionData.hostPhoto} 
                  alt="Current host photo" 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Function Details'}
          </button>
        </form>
      </div>

      {/* User Management */}
      <div className="card">
        <h3>Create New User</h3>
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              required
              placeholder="Enter user email"
            />
          </div>

          <div className="form-group">
            <label>Password (Optional - will generate random if empty)</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              placeholder="Enter password or leave empty for random"
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>User Management</h3>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    <span className={`user-badge ${user.isFirstLogin ? 'bg-warning' : 'bg-success'}`}>
                      {user.isFirstLogin ? 'First Login Pending' : 'Active'}
                    </span>
                  </td>
                  <td>{user.createdAt.toDate().toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn" 
                      style={{ padding: '5px 10px', marginRight: '5px' }}
                      onClick={() => handleResetPassword(user.id, user.email)}
                    >
                      Reset Password
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '5px 10px' }}
                      onClick={() => handleDeleteUser(user.id, user.email)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPortal;
