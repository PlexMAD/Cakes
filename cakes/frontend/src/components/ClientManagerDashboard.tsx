import React from 'react';

const ClientManagerDashboard: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

    return (
        <div>
            <h1>Client Manager Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default ClientManagerDashboard;
