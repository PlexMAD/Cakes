import React from 'react';

const DirectorDashboard: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

    return (
        <div>
            <h1>Director Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default DirectorDashboard;
