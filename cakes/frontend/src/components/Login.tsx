import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // Укажите путь к логотипу

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
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            const userResponse = await axios.get('http://127.0.0.1:8000/api/current_user/', {
                headers: {
                  Authorization: `Bearer ${response.data.access}`,
                },
              });
            setUserRole(userResponse.data.role);
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
        <div className="center-container">
            <div className="login">
                <img src={logo} alt="Логотип" className="login__logo" />
                <h2 className="login__title">Войти в аккаунт</h2>
                <input
                    type="text"
                    placeholder="Логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    disabled={isBlocked}
                    className="login__input"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isBlocked}
                    className="login__input"
                />
                <button onClick={handleLogin} disabled={isBlocked} className="login__button">Вход</button>
                {error && <p className="login__error">{error}</p>}
                {isBlocked && <p className="login__blocked">Форма заблокирована на 5 секунд</p>}
            </div>
        </div>
    );
};

export default Login;
