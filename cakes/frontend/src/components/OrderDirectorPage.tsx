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
        <div className="orders-director">
            <h1 className="orders-director__title">Список всех заказов</h1>
            <table className="orders-director__table">
                <thead>
                    <tr>
                        <th className="orders-director__table-header">ID</th>
                        <th className="orders-director__table-header">Номер</th>
                        <th className="orders-director__table-header">Дата</th>
                        <th className="orders-director__table-header">Название</th>
                        <th className="orders-director__table-header">Статус</th>
                        <th className="orders-director__table-header">Цена</th>
                        <th className="orders-director__table-header">Покупатель</th>
                        <th className="orders-director__table-header">Срок</th>
                        <th className="orders-director__table-header">Менеджер</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id} className="orders-director__table-row">
                            <td className="orders-director__table-cell">{order.id}</td>
                            <td className="orders-director__table-cell">{order.number}</td>
                            <td className="orders-director__table-cell">{order.date}</td>
                            <td className="orders-director__table-cell">{order.name}</td>
                            <td className="orders-director__table-cell">{getStatusName(order.status)}</td>
                            <td className="orders-director__table-cell">{order.price}</td>
                            <td className="orders-director__table-cell">{getUserName(order.buyer)}</td>
                            <td className="orders-director__table-cell">{order.deadline}</td>
                            <td className="orders-director__table-cell">{getUserName(order.manager)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderDirectorPage;
