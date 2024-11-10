import React from 'react';

const DirectorDashboard: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

return (
    <div className="dashboard">
        <h1 className="dashboard__title">Director Dashboard</h1>
        <button onClick={handleLogout} className="dashboard__logout-button">Выйти</button>
    </div>
);
}

export default DirectorDashboard;
