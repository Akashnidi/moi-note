import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MoneyEntryPage = ({ user, functionData }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    address: '',
    amount: ''
  });
  const [entries, setEntries] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch entries
    const q = query(collection(db, 'entries'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData = [];
      querySnapshot.forEach((doc) => {
        entriesData.push({ id: doc.id, ...doc.data() });
      });
      setEntries(entriesData);
    });

    // Fetch user count
    const fetchUserCount = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        setUserCount(usersSnapshot.size);
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };

    fetchUserCount();
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await addDoc(collection(db, 'entries'), {
        guestName: formData.guestName,
        address: formData.address,
        amount: parseFloat(formData.amount),
        enteredBy: user.email,
        timestamp: new Date(),
        functionName: functionData.functionName,
        functionDate: functionData.date,
        hostName: functionData.hostName
      });

      setSuccess('Entry added successfully!');
      setFormData({ guestName: '', address: '', amount: '' });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error adding entry: ' + error.message);
    }
    setLoading(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${functionData.functionName} - Money Collection Report`, 20, 20);
    
    // Add function details
    doc.setFontSize(12);
    doc.text(`Date: ${functionData.date}`, 20, 35);
    doc.text(`Host: ${functionData.hostName}`, 20, 45);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);
    
    // Prepare table data
    const tableData = entries.map((entry, index) => [
      index + 1,
      entry.guestName,
      entry.address,
      `₹${entry.amount.toLocaleString()}`,
      entry.enteredBy,
      entry.timestamp.toDate().toLocaleDateString()
    ]);
    
    // Calculate total
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    
    // Add table
    doc.autoTable({
      head: [['S.No', 'Guest Name', 'Address', 'Amount', 'Entered By', 'Date']],
      body: tableData,
      startY: 65,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    // Add total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Amount: ₹${total.toLocaleString()}`, 20, finalY);
    doc.text(`Total Entries: ${entries.length}`, 20, finalY + 10);
    
    doc.save(`${functionData.functionName}_Report.pdf`);
  };

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div>
      <div className="stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{userCount}</p>
        </div>
        <div className="stat-card">
          <h3>Total Entries</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{entries.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Amount</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="card">
        <h3>Add New Entry</h3>
        
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Guest Name</label>
            <input
              type="text"
              name="guestName"
              value={formData.guestName}
              onChange={handleChange}
              required
              placeholder="Enter guest name"
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter address"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="Enter amount"
              min="1"
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Entry'}
          </button>
          
          <button type="button" className="btn btn-secondary" onClick={generatePDF}>
            Generate PDF Report
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Recent Entries</h3>
        {entries.length === 0 ? (
          <p>No entries yet.</p>
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
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id}>
                  <td>{index + 1}</td>
                  <td>{entry.guestName}</td>
                  <td>{entry.address}</td>
                  <td>₹{entry.amount.toLocaleString()}</td>
                  <td>{entry.enteredBy}</td>
                  <td>{entry.timestamp.toDate().toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MoneyEntryPage;
