import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './pages/AdminDashboard';
import { VotePage } from './pages/VotePage';
import { ScrolltellingPage } from './pages/ScrolltellingPage';

export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ScrolltellingPage />} />
        <Route path="/presentacion" element={<ScrolltellingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/q/:id" element={<VotePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
