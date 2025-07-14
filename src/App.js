import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MoneyEntryPage from './pages/MoneyEntryPage';
import RecordEditorPage from './pages/RecordEditorPage';
import AdminPortal from './pages/AdminPortal';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [functionData, setFunctionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch function data
        try {
          const functionDoc = await getDoc(doc(db, 'settings', 'functionData'));
          if (functionDoc.exists()) {
            setFunctionData(functionDoc.data());
          } else {
            // Create default function data
            const defaultFunctionData = {
              functionName: 'Wedding Function',
              date: new Date().toISOString().split('T')[0],
              hostName: 'Host Name',
              hostPhoto: '',
              createdAt: new Date()
            };
            await setDoc(doc(db, 'settings', 'functionData'), defaultFunctionData);
            setFunctionData(defaultFunctionData);
          }
        } catch (error) {
          console.error('Error fetching function data:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Layout user={user} functionData={functionData}>
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                user.email === 'admin@money-tracker.com' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/entry" replace />
                )
              ) : (
                <LoginPage functionData={functionData} />
              )
            } 
          />
          
          <Route 
            path="/entry" 
            element={
              <ProtectedRoute user={user}>
                <MoneyEntryPage user={user} functionData={functionData} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/records" 
            element={
              <ProtectedRoute user={user}>
                <RecordEditorPage user={user} functionData={functionData} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute user={user} adminOnly={true}>
                <AdminPortal 
                  functionData={functionData} 
                  setFunctionData={setFunctionData}
                />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

