import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
    id: number;
    number: string;
    date: string;
    name: string;
    status: number;
    price: string;
    buyer: number;
    deadline: string;
    manager: number;
}

interface User {
    id: number;
    full_name: string;
    role: string;
}

interface Status {
    id: number;
    name: string;
}

const OrderDirectorPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersResponse, usersResponse, statusesResponse] = await Promise.all([
                    axios.get<Order[]>('http://127.0.0.1:8000/api/order/'),
                    axios.get<User[]>('http://127.0.0.1:8000/api/users/'),
                    axios.get<Status[]>('http://127.0.0.1:8000/api/status/')
                ]);
                setOrders(ordersResponse.data);
                setUsers(usersResponse.data);
                setStatuses(statusesResponse.data);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };
        fetchData();
    }, []);

    const getUserName = (userId: number) => users.find(user => user.id === userId)?.full_name || 'Неизвестно';
    const getStatusName = (statusId: number) => statuses.find(status => status.id === statusId)?.name || 'Неизвестно';

    return (
        <div>
            <h1>Список всех заказов</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Номер</th>
                        <th>Дата</th>
                        <th>Название</th>
                        <th>Статус</th>
                        <th>Цена</th>
                        <th>Покупатель</th>
                        <th>Срок</th>
                        <th>Менеджер</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.number}</td>
                            <td>{order.date}</td>
                            <td>{order.name}</td>
                            <td>{getStatusName(order.status)}</td>
                            <td>{order.price}</td>
                            <td>{getUserName(order.buyer)}</td>
                            <td>{order.deadline}</td>
                            <td>{getUserName(order.manager)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderDirectorPage;
