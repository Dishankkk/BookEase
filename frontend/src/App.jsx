import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import IssuePage from './pages/IssuePage';
import ReturnPage from './pages/ReturnPage';
import StudentPage from './pages/StudentPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      {/* Toast notifications container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: { primary: '#22c55e', secondary: '#fff' }
          },
          error: {
            duration: 5000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' }
          }
        }}
      />

      {/* Navigation Bar - appears on all pages */}
      <Navbar />

      {/* Main content area */}
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/issue" element={<IssuePage />} />
          <Route path="/return" element={<ReturnPage />} />
          <Route path="/student/:rollNumber" element={<StudentPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;