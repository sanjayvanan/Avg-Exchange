// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Markets from './pages/Markets'; // Ensure Markets is imported
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop'; // <--- Import the new component

function App() {
  const user = useSelector((state) => state.auth.user);

  return (
    <BrowserRouter>
      {/* Triggers scroll to top on route change */}
      <ScrollToTop />
      
      <div className="min-h-screen bg-[#0b0c0e] selection:bg-[#00D68F]/30">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Markets Route */}
            <Route path="/markets" element={<Markets />} />
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <Signup /> : <Navigate to="/" />} 
            />
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;