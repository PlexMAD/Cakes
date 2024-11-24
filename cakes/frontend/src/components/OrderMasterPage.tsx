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

interface Status {
    id: number;
    name: string;
}

const OrderMasterPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);

    useEffect(() => {
        const fetchOrdersAndStatuses = async () => {
            try {
                const [ordersResponse, statusesResponse] = await Promise.all([
                    axios.get<Order[]>('http://127.0.0.1:8000/api/order/'),
                    axios.get<Status[]>('http://127.0.0.1:8000/api/status/')
                ]);
                setOrders(ordersResponse.data);
                setStatuses(statusesResponse.data);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };
        fetchOrdersAndStatuses();
    }, []);

    const getStatusName = (statusId: number) => statuses.find(status => status.id === statusId)?.name || 'Неизвестно';

    const handleStatusChange = async (orderId: number, newStatus: number) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/order/${orderId}/`, { status: newStatus });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            console.error('Ошибка при изменении статуса заказа:', error);
        }
    };
    const assureQuality = async (orderId: number) => {
        try {

        }
        catch (error) {
            console.error('Ошибка')
        }
    }

    return (
        <div>
            <h1>Список заказов для мастера</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Номер</th>
                        <th>Дата</th>
                        <th>Название</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {orders
                        .filter(order => [6, 7].includes(order.status)) // Фильтр по статусам "Производство" и "Контроль"
                        .map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.number}</td>
                                <td>{order.date}</td>
                                <td>{order.name}</td>
                                <td>{getStatusName(order.status)}</td>
                                <td>
                                    {order.status === 6 && (
                                        <button onClick={() => handleStatusChange(order.id, 7)}>
                                            Перевести на "Контроль"
                                        </button>
                                    )}
                                    {order.status === 7 && (
                                        <button onClick={() => handleStatusChange(order.id, 8)}>
                                            Перевести на "Готов"
                                        </button>
                                    )}
                                    {order.status === 7 && (
                                        <button onClick={() => assureQuality(order.id)}>
                                            Провести проверку качества
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderMasterPage;
