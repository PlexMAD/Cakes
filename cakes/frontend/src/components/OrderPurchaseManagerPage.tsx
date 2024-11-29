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
    product: number
}

interface Status {
    id: number;
    name: string;
}

const OrderPurchaseManagerPage: React.FC = () => {
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

    const handleStatusChange = async (orderId: number, newStatus: number, orderProduct: number) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/api/order/${orderId}/`, { status: newStatus });
            await axios.get(`http://127.0.0.1:8000/api/product/${orderProduct}/produce/`)

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            console.error('Ошибка при изменении статуса заказа:', error);
        }
    };

    return (
        <div className='purchase-manager-orders'>
            <h1 className='purchase-manager-orders__title'>Список заказов для менеджера по закупкам</h1>
            <table className='purchase-manager-orders__table'>
                <thead className='purchase-manager-orders__table-head'>
                    <tr className='purchase-manager-orders__table-row'>
                        <th className='purchase-manager-orders__table-header'>ID</th>
                        <th className='purchase-manager-orders__table-header'>Номер</th>
                        <th className='purchase-manager-orders__table-header'>Дата</th>
                        <th className='purchase-manager-orders__table-header'>Название</th>
                        <th className='purchase-manager-orders__table-header'>Статус</th>
                        <th className='purchase-manager-orders__table-header'>Действия</th>
                    </tr>
                </thead>
                <tbody className='purchase-manager-orders__table-body'>
                    {orders
                        .filter(order => order.status === 5) 
                        .map(order => (
                            <tr  className='purchase-manager-orders__table-row' key={order.id}>
                                <td className='purchase-manager-orders__table-cell'>{order.id}</td>
                                <td className='purchase-manager-orders__table-cell'>{order.number}</td>
                                <td className='purchase-manager-orders__table-cell'>{order.date}</td>
                                <td className='purchase-manager-orders__table-cell'>{order.name}</td>
                                <td className='purchase-manager-orders__table-cell'>{getStatusName(order.status)}</td>
                                <td>
                                    <button className='purchase-manager-orders__table-action-button purchase-manager-orders__table-action-button--accept' onClick={() => handleStatusChange(order.id, 6, order.product)}>
                                        Перевести на "Производство"
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderPurchaseManagerPage;
