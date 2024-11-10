import React from 'react';

const ClientManagerDashboard: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

    return (
        <div className="dashboard">
            <h1 className="dashboard__title">Client Manager Dashboard</h1>
            <button onClick={handleLogout} className="dashboard__logout-button">Выйти</button>
        </div>
    );
}

export default ClientManagerDashboard;
