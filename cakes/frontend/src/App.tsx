import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import Login from './components/Login'
import axios from 'axios';
import './App.css';


function App() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/current_user/', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserRole(response.data.roleid);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, []);
  if (loading) {
    return <div>Loading...</div>; 
  }

  const getRedirectPath = () => {
    if (userRole === "1") {
      return "/admin-panel"; 
    } else if (userRole === "2") {
      return "/user-panel"; 
    }
    return "/"; 
  };
  return (
    <Router>
      <Routes>
      <Route path="/" element={userRole ? <Navigate to={getRedirectPath()} /> : <Login setUserRole={setUserRole} />} />
      </Routes>
    </Router>
  );
}

export default App;
