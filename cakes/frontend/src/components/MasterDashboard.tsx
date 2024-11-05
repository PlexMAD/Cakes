import React from 'react';

const MasterDashboard: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

return (
    <div className="dashboard">
        <h1 className="dashboard__title">Master Dashboard</h1>
        <button onClick={handleLogout} className="dashboard__logout-button">Выйти</button>
    </div>
);
}

export default MasterDashboard;
