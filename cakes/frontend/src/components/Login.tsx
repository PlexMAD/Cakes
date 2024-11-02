import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
    setUserRole: (role: string) => void;
}

const Login: React.FC<LoginProps> = ({ setUserRole }) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (isBlocked) return;
        
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/login/', { login, password });
            setUserRole(response.data.role);
            navigate('/');
        } catch (error) {
            setError('Неправильный логин или пароль');
            setAttempts(prev => prev + 1);
        }
    };

    useEffect(() => {
        if (attempts >= 3) {
            setIsBlocked(true);
            setTimeout(() => {
                setIsBlocked(false);
                setAttempts(0);
            }, 5000);
        }
    }, [attempts]);

    return (
        <div>
            <h2>Вход в систему</h2>
            <input
                type="text"
                placeholder="Логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                disabled={isBlocked}
            />
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isBlocked}
            />
            <button onClick={handleLogin} disabled={isBlocked}>Войти</button>
            {error && <p>{error}</p>}
            {isBlocked && <p>Форма заблокирована на 5 секунд</p>}
        </div>
    );
};

export default Login;
