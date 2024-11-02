import React, { useState } from 'react';
import axios from 'axios';

const BuyerRegistration: React.FC = () => {
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [role, setRole] = useState<string>('buyer');
    const [photo, setPhoto] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);
        formData.append('full_name', fullName);
        formData.append('role', role);
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
        <form onSubmit={handleSubmit}>
            <label>
                Login:
                <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required />
            </label>
            <label>
                Password:
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    pattern="^(?!.*login)(?=.*[a-z])(?=.*[A-Z]).{5,20}$"
                    title="Password must be 5-20 characters, contain uppercase and lowercase letters, and not include the login."
                />
            </label>
            <label>
                Full Name:
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label>
                Role:
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} />
            </label>
            <label>
                Photo:
                <input type="file" onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)} />
            </label>
            <button type="submit">Register</button>
        </form>
    );
};

export default BuyerRegistration;
