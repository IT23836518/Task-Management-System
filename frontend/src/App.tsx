import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import './App.css';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '16px' }}>Loading workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Dashboard Placeholder (Step 7 will replace this)
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '600px', 
      margin: '100px auto', 
      background: 'var(--surface-color)', 
      borderRadius: '16px', 
      border: '1px solid var(--surface-border)', 
      textAlign: 'center',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
    }}>
      <h1 style={{ marginBottom: '16px', fontWeight: 700 }}>Welcome, {user.name}!</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        You have successfully authenticated via JWT. This is your dashboard placeholder.
      </p>
      <button 
        onClick={logout} 
        style={{
          background: 'var(--error-color)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)'
        }}
      >
        Log Out
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
