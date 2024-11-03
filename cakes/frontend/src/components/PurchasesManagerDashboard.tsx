import React from 'react';

const PurchasesManagerDashboard: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

    return (
        <div>
            <h1>Purchase Manager Dashboard</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default PurchasesManagerDashboard;
