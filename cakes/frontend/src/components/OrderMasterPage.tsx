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
        <div className='master-orders'>
            <h1 className='master-orders__title'>Список заказов для мастера</h1>
            <table className='master-orders__table'>
                <thead className='master-orders__table-head'>
                    <tr className='master-orders__table-row'>
                        <th className='master-orders__table-header'>ID</th>
                        <th className='master-orders__table-header'>Номер</th>
                        <th className='master-orders__table-header'>Дата</th>
                        <th className='master-orders__table-header'>Название</th>
                        <th className='master-orders__table-header'>Статус</th>
                        <th className='master-orders__table-header'>Действия</th>
                    </tr>
                </thead>
                <tbody className='master-orders__table-body'>
                    {orders
                        .filter(order => [6, 7].includes(order.status))
                        .map(order => (
                            <tr className='master-orders__table-row' key={order.id}>
                                <td className='master-orders__table-cell'>{order.id}</td>
                                <td className='master-orders__table-cell'>{order.number}</td>
                                <td className='master-orders__table-cell'>{order.date}</td>
                                <td className='master-orders__table-cell'>{order.name}</td>
                                <td className='master-orders__table-cell'>{getStatusName(order.status)}</td>
                                <td className='master-orders__table-cell--actions'>
                                    {order.status === 6 && (
                                        <button className='master-orders__table-action-button master-orders__table-action-button--contol'onClick={() => handleStatusChange(order.id, 7)}>
                                            Перевести на "Контроль"
                                        </button>
                                    )}
                                    {order.status === 7 && (
                                        <>
                                            <button className='master-orders__table-action-button master-orders__table-action-button--complete' onClick={() => handleSetReady(order.id)}>
                                                Перевести на "Готов"
                                            </button>
                                            <button className='master-orders__table-action-button master-orders__table-action-button--check'
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
                        <h2 className='master-orders-modal__title'>Проверка качества</h2>
                        <label className='master-orders-modal__label'>
                            Параметр:
                            <input
                                type="text"
                                className='master-orders-modal__input'
                                value={parameter}
                                onChange={(e) => setParameter(e.target.value)}
                            />
                        </label>
                        <label className='master-orders-modal__checkbox'>
                            Проверено:
                            <input
                                type="checkbox"
                                className='master-orders-modal__checkbox-input'
                                checked={assurance}
                                onChange={(e) => setAssurance(e.target.checked)}
                            />
                        </label>
                        <label className='master-orders-modal__label'>
                            Комментарий:
                            <textarea
                                className='master-orders-modal__textarea'
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </label>
                        <div className='master-orders-modal__buttons'>
                            <button className='master-orders-modal__button master-orders-modal__button--save' onClick={handleQualityCheck}>Сохранить</button>
                            <button className='master-orders-modal__button master-orders-modal__button--cancel' onClick={() => setModalOpen(false)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderMasterPage;
