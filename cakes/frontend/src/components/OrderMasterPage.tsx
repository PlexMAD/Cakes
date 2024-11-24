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

interface QualityCheck {
    id: number;
    parameter: string;
    assured: boolean;
    comment: string;
    order: number;
}

const OrderMasterPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [parameter, setParameter] = useState('');
    const [assurance, setAssurance] = useState(false);
    const [comment, setComment] = useState('');

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

    const checkAllQualityAssured = async (orderId: number) => {
        try {
            const response = await axios.get<QualityCheck[]>(`http://127.0.0.1:8000/api/quality/?order=${orderId}`);
            return response.data.every(qc => qc.assured);
        } catch (error) {
            console.error('Ошибка при проверке качества:', error);
            return false;
        }
    };

    const handleSetReady = async (orderId: number) => {
        const allQualityChecked = await checkAllQualityAssured(orderId);
        if (!allQualityChecked) {
            alert('Не все параметры отмечены как проверенные. Нельзя изменить статус заказа на "Готов".');
            return;
        }
        handleStatusChange(orderId, 8);
    };

    const handleQualityCheck = async () => {
        if (selectedOrderId === null) return;
        try {
            const existingChecksResponse = await axios.get<QualityCheck[]>(
                `http://127.0.0.1:8000/api/quality/?order=${selectedOrderId}`
            );
            const existingCheck = existingChecksResponse.data.find(
                (qc) => qc.parameter === parameter
            );
    
            if (existingCheck) {
                await axios.patch(`http://127.0.0.1:8000/api/quality/${existingCheck.id}/`, {
                    assured: assurance,
                    comment: comment,
                });
            } else {
                await axios.post(`http://127.0.0.1:8000/api/quality/`, {
                    order: selectedOrderId,
                    parameter: parameter,
                    assured: assurance,
                    comment: comment,
                });
            }
    
            setModalOpen(false);
            setParameter('');
            setAssurance(false);
            setComment('');
        } catch (error) {
            console.error('Ошибка при проверке качества:', error);
        }
    };
    

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
                        .filter(order => [6, 7].includes(order.status))
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
                                        <>
                                            <button onClick={() => handleSetReady(order.id)}>
                                                Перевести на "Готов"
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrderId(order.id);
                                                    setModalOpen(true);
                                                }}
                                            >
                                                Провести проверку качества
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Проверка качества</h2>
                        <label>
                            Параметр:
                            <input
                                type="text"
                                value={parameter}
                                onChange={(e) => setParameter(e.target.value)}
                            />
                        </label>
                        <label>
                            Проверено:
                            <input
                                type="checkbox"
                                checked={assurance}
                                onChange={(e) => setAssurance(e.target.checked)}
                            />
                        </label>
                        <label>
                            Комментарий:
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </label>
                        <div>
                            <button onClick={handleQualityCheck}>Сохранить</button>
                            <button onClick={() => setModalOpen(false)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderMasterPage;
