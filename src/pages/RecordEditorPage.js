import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';

const RecordEditorPage = ({ user, functionData }) => {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({
    guestName: '',
    address: '',
    amount: ''
  });
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'entries'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData = [];
      querySnapshot.forEach((doc) => {
        entriesData.push({ id: doc.id, ...doc.data() });
      });
      setEntries(entriesData);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setEditFormData({
      guestName: entry.guestName,
      address: entry.address,
      amount: entry.amount.toString()
    });
    setShowPasswordModal(true);
  };

  const handlePasswordConfirmation = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify password by attempting to sign in
      await signInWithEmailAndPassword(auth, user.email, passwordConfirmation);
      setShowPasswordModal(false);
      setPasswordConfirmation('');
      // Password is correct, proceed with edit
    } catch (error) {
      setError('Invalid password');
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateDoc(doc(db, 'entries', editingEntry.id), {
        guestName: editFormData.guestName,
        address: editFormData.address,
        amount: parseFloat(editFormData.amount),
        lastModified: new Date(),
        modifiedBy: user.email
      });

      setSuccess('Entry updated successfully!');
      setEditingEntry(null);
      setEditFormData({ guestName: '', address: '', amount: '' });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error updating entry: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteDoc(doc(db, 'entries', entryId));
        setSuccess('Entry deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Error deleting entry: ' + error.message);
      }
    }
  };

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Entries</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{entries.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Amount</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{totalAmount.toLocaleString()}</p>
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

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '400px', margin: 0 }}>
            <h3>Confirm Password</h3>
            <p>Please enter your password to edit this entry:</p>
            <form onSubmit={handlePasswordConfirmation}>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Confirm'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordConfirmation('');
                  setEditingEntry(null);
                  setError('');
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingEntry && !showPasswordModal && (
        <div className="card">
          <h3>Edit Entry</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Guest Name</label>
              <input
                type="text"
                value={editFormData.guestName}
                onChange={(e) => setEditFormData({...editFormData, guestName: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                value={editFormData.address}
                onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                required
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                value={editFormData.amount}
                onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                required
                min="1"
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Entry'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setEditingEntry(null);
                setEditFormData({ guestName: '', address: '', amount: '' });
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>All Entries</h3>
        {entries.length === 0 ? (
          <p>No entries found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Guest Name</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Entered By</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{index + 1}</td>
                  <td>{entry.guestName}</td>
                  <td>{entry.address}</td>
                  <td>₹{entry.amount.toLocaleString()}</td>
                  <td>
                    {entry.enteredBy}
                    {entry.modifiedBy && (
                      <span className="user-badge">Modified by {entry.modifiedBy}</span>
                    )}
                  </td>
                  <td>{entry.timestamp.toDate().toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn" 
                      style={{ padding: '5px 10px', marginRight: '5px' }}
                      onClick={() => handleEdit(entry)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '5px 10px' }}
                      onClick={() => handleDelete(entry.id)}
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

export default RecordEditorPage;
