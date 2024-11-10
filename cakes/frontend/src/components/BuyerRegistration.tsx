import React, { useState } from 'react';
import axios from 'axios';

const BuyerRegistration: React.FC = () => {
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setPhoto(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isPasswordValid = (password: string) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const isCorrectLength = password.length >= 5 && password.length <= 20;
        const doesNotContainLogin = !password.includes(login);
        return hasUpperCase && hasLowerCase && isCorrectLength && doesNotContainLogin;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isPasswordValid(password)) {
            setPasswordError('Пароль должен быть от 5 до 20 символов, содержать заглавные и маленькие буквы, и не содержать логин');
            return;
        }

        setPasswordError(null);

        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);
        formData.append('full_name', fullName);
        formData.append('role', 'Заказчик');
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/users/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('User registered:', response.data);
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="center-container">
            <form className="registration" onSubmit={handleSubmit}>
                <h2 className="registration__title">Зарегистрироваться</h2>
                <input
                    type="text"
                    placeholder="Введите Ф.И.О."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="registration__input"
                    required
                />
                <input
                    type="text"
                    placeholder="Логин"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="registration__input"
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="registration__input"
                    required
                />
                {passwordError && <p className="registration__error">{passwordError}</p>}
                <label className="registration__label">
                    Загрузите фото профиля
                    <input
                        type="file"
                        onChange={handlePhotoChange}
                        className="registration__file-input"
                        accept="image/*"
                    />
                </label>
                {photoPreview && (
                    <img src={photoPreview} alt="Фото профиля" className="registration__photo-preview" />
                )}
                <button type="submit" className="registration__button">Создать аккаунт</button>
            </form>
        </div>
    );
};

export default BuyerRegistration;
