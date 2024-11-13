import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import Login from './components/Login'
import axios from 'axios';
import './App.css';
import PrivateRoute from './components/PrivateRoute';
import BuyerDashboard from './components/BuyerDashboard';
import DirectorDashboard from './components/DirectorDashboard';
import MasterDashboard from './components/MasterDashboard';
import PurchasesManagerDashboard from './components/PurchasesManagerDashboard';
import ClientManagerDashboard from './components/ClientManagerDashboard';
import BuyerRegistration from './components/BuyerRegistration';
import EquipmentPage from './components/EquipmentPage';
import IngredientsPage from './components/IngredientsPage';
import DecorationsPage from './components/DecorationsPage';
import RescueMap from './components/RescueMap';
import OrderPage from './components/OrderPage';
import OrderManagerPage from './components/OrderManagerPage';

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
          setUserRole(response.data.role);
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
    if (userRole === "Заказчик") {
      return "/buyer-panel"; 
    } else if (userRole === "Менеджер по работе с клиентами") {
      return "/clientmanager-panel"; 
    } else if (userRole === "Менеджер по закупкам") {
      return "/purchasemanager-panel"; 
    } else if (userRole === "Мастер") {
      return "/master-panel"; 
    } else if (userRole === "Директор") {
      return "/director-panel"; 
    }
    return "/"; 
  };

  const canAccessIngredientsAndDecorations = userRole !== "Заказчик";

  return (
    <Router>
      <Routes>
        <Route path="/" element={userRole ? <Navigate to={getRedirectPath()} /> : <Login setUserRole={setUserRole} />} />
        <Route path="/buyer-panel" element={<PrivateRoute component={BuyerDashboard} role={"Заказчик"} userRole={userRole} />} />
        <Route path="/equipment-page" element={<PrivateRoute component={EquipmentPage} role={"Директор"} userRole={userRole} />} />
        <Route path="/reg-panel" element={<PrivateRoute component={BuyerRegistration} role={"Менеджер по работе с клиентами"} userRole={userRole} />} />
        <Route path="/ingredient-page" element={<PrivateRoute component={IngredientsPage} role={"Директор"} userRole={userRole} canAccess={canAccessIngredientsAndDecorations} />} />
        <Route path="/decoration-page" element={<PrivateRoute component={DecorationsPage} role={"Директор"} userRole={userRole} canAccess={canAccessIngredientsAndDecorations} />} />
        
        <Route path="/orders" element={<PrivateRoute component={OrderPage} role={"Заказчик"} userRole={userRole} />} />
        <Route path="/orders-manager" element={<PrivateRoute component={OrderManagerPage} role={"Менеджер по работе с клиентами"} userRole={userRole} />} />

        <Route path="/map" element={<PrivateRoute component={RescueMap} role={"Директор"} userRole={userRole} />} />
        <Route path="/clientmanager-panel" element={<PrivateRoute component={ClientManagerDashboard} role={"Менеджер по работе с клиентами"} userRole={userRole} />} />
        <Route path="/purchasemanager-panel" element={<PrivateRoute component={PurchasesManagerDashboard} role={"Менеджер по закупкам"} userRole={userRole} />} />
        <Route path="/master-panel" element={<PrivateRoute component={MasterDashboard} role={"Мастер"} userRole={userRole} />} />
        <Route path="/director-panel" element={<PrivateRoute component={DirectorDashboard} role={"Директор"} userRole={userRole} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
