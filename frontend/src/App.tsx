import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateWill from './pages/CreateWill';
import ViewWill from './pages/ViewWill';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateWill />} />
            <Route path="/view" element={<ViewWill />} />
          </Routes>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App; 