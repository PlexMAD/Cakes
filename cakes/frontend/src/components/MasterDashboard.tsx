import React from 'react';

const MasterDashboard: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

    return (
        <div>
            <h1>Master Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default MasterDashboard;
