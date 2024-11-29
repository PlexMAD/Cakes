import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: number;
  full_name: string;
  role: string;
}

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

const OrderManagerPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<{ [key: number]: string }>({});
  const [statuses, setStatuses] = useState<{ [key: number]: string }>({});
  const [clients, setClients] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [examples, setExamples] = useState('');
  const [clientId, setClientId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const token = localStorage.getItem('access_token');
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        console.error('Токен отсутствует. Авторизуйтесь, чтобы получить доступ.');
        return;
      }
      try {
        const response = await axios.get<User>('http://127.0.0.1:8000/api/current_user/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Ошибка при получении текущего пользователя:', error);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get<Order[]>('http://127.0.0.1:8000/api/order/');
        setOrders(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>('http://127.0.0.1:8000/api/users/');
        const usersMap = response.data.reduce((map, user) => {
          map[user.id] = user.full_name;
          return map;
        }, {} as { [key: number]: string });
        setUsers(usersMap);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    };

    const fetchStatuses = async () => {
      try {
        const response = await axios.get<Status[]>('http://127.0.0.1:8000/api/status/');
        const statusesMap = response.data.reduce((map, status) => {
          map[status.id] = status.name;
          return map;
        }, {} as { [key: number]: string });
        setStatuses(statusesMap);
      } catch (error) {
        console.error('Ошибка при загрузке статусов:', error);
      }
    };

    const fetchBuyers = async () => {
      try {
        const response = await axios.get<User[]>('http://127.0.0.1:8000/api/users/');
        const clients = response.data.filter(user => user.role === 'Заказчик');
        setClients(clients);
      } catch (error) {
        console.error('Ошибка при загрузке менеджеров:', error);
      }
    };

    fetchCurrentUser();
    fetchOrders();
    fetchUsers();
    fetchStatuses();
    fetchBuyers();
  }, [token]);
  const userOrders = orders.filter(order => order.manager === currentUser?.id);
  const generateOrderNumber = async () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    try {
      const lastOrderResponse = await axios.get<Order[]>('http://127.0.0.1:8000/api/order/');
      const lastOrder = lastOrderResponse.data[lastOrderResponse.data.length - 1];
      const lastOrderNumber = parseInt(lastOrder?.number.slice(-2)) || 0;
      const newOrderNumber = String(lastOrderNumber + 1).padStart(2, '0');

      if (clientId) {
        const client = clients.find(client => client.id === clientId);
        if (client) {
          const [surname, name] = client.full_name.split(' ');
          const orderNumber = `${day}${month}${year}${surname[0]}${name[0]}${newOrderNumber}`;
          return orderNumber;
        }
      }
      return `${day}${month}${year}??${newOrderNumber}`;
    } catch (error) {
      console.error('Ошибка при генерации номера заказа:', error);
      return '';
    }
  };
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const number = await generateOrderNumber();

    if (!currentUser) {
      console.error("Текущий пользователь не найден.");
      return;
    }

    const productId = 1;
    const price = 1000;
    const currentDate = new Date().toISOString().split('T')[0];
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    const deadlineDate = deadline.toISOString().split('T')[0];
    const statusId = 1;

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/order/', {
        name,
        description,
        dimensions,
        examples,
        manager: currentUser.id,
        number,
        price,
        product: productId,
        buyer: clientId,
        date: currentDate,
        deadline: deadlineDate,
        status: statusId,
      });
      alert('Заказ создан успешно');

      setOrders(prevOrders => [...prevOrders, response.data]);
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
    }
  };
  const handleAcceptOrder = async (orderId: number) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/order/${orderId}/`, { status: 3 });
      setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: 3 } : order));
      alert('Статус заказа изменен');
    } catch (error) {
      console.error('Ошибка при изменении статуса заказа:', error);
    }
  };
  const handleCancelOrder = async (orderId: number) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/order/${orderId}/`, { status: 2 });
      setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: 2 } : order));
      alert('Статус заказа изменен');
    } catch (error) {
      console.error('Ошибка при изменении статуса заказа:', error);
    }
  };
  const handleFinalAcceptOrder = async (orderId: number) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/order/${orderId}/`, { status: 4 });
      setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: 4 } : order));
      alert('Статус заказа изменен');
    } catch (error) {
      console.error('Ошибка при изменении статуса заказа:', error);
    }
  };
  const handleApproveZakupkaOrder = async (orderId: number) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/order/${orderId}/`, { status: 5 });
      setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: 5 } : order));
      alert('Статус заказа изменен');
    } catch (error) {
      console.error('Ошибка при изменении статуса заказа:', error);
    }
  };
  const handleDoOrder = async (orderId: number) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/order/${orderId}/`, { status: 9 });
      setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: 9 } : order));
      alert('Статус заказа изменен');
    } catch (error) {
      console.error('Ошибка при изменении статуса заказа:', error);
    }
  };

  return (
    <div className='client-manager-orders'>
      <h2 className='client-manager-orders__title'>Мои заказы</h2>
      <table className='client-manager-orders__table'>
        <thead className='client-manager-orders__table-head'>
          <tr className='client-manager-orders__table-row'>
            <th className='client-manager-orders__table-header'>Номер</th>
            <th className='client-manager-orders__table-header'>Дата</th>
            <th className='client-manager-orders__table-header'>Наименование</th>
            <th className='client-manager-orders__table-header'>Статус</th>
            <th className='client-manager-orders__table-header'>Стоимость</th>
            <th className='client-manager-orders__table-header'>Дата выполнения</th>
            <th className='client-manager-orders__table-header'>Имя заказчика</th>
            <th className='client-manager-orders__table-header'>Действия</th>
          </tr>
        </thead>
        <tbody className='client-manager-orders__table-body'>
          {userOrders.map((order) => (
            <tr className='client-manager-orders__table-row' key={order.id}>
              <td className='client-manager-orders__table-cell'>{order.number}</td>
              <td className='client-manager-orders__table-cell'>{order.date}</td>
              <td className='client-manager-orders__table-cell'>{order.name}</td>
              <td className='client-manager-orders__table-cell'>{statuses[order.status] || 'Неизвестно'}</td>
              <td className='client-manager-orders__table-cell'>{order.price}</td>
              <td className='client-manager-orders__table-cell'>{order.deadline}</td>
              <td className='client-manager-orders__table-cell'>{users[order.buyer] || 'Неизвестно'}</td>
              <td className='client-manager-orders__table-cell--actions'>
                {order.status === 1 && (
                  <button className='client-manager-orders__table-action-button client-manager-orders__table-action-button--accept' onClick={() => handleAcceptOrder(order.id)}>Принять</button>
                )}
                {(order.status === 1 || order.status === 4) && (
                  <button className='client-manager-orders__table-action-button client-manager-orders__table-action-button--cancel' onClick={() => handleCancelOrder(order.id)}>Отменить заказ</button>
                )}
                {(order.status === 3) && (
                  <button className='client-manager-orders__table-action-button client-manager-orders__table-action-button--verification' onClick={() => handleFinalAcceptOrder(order.id)}>Отправить на подтверждение</button>
                )}
                {(order.status === 4) && (
                  <button className='client-manager-orders__table-action-button client-manager-orders__table-action-button--approve' onClick={() => handleApproveZakupkaOrder(order.id)}>Отправить на закупку</button>
                )}
                {(order.status === 8) && (
                  <button className='client-manager-orders__table-action-button client-manager-orders__table-action-button--do' onClick={() => handleDoOrder(order.id)}>Выполнить</button>
                )}
                  {/* Добавляем проверку на выполнен/отменен */}
                  {(order.status === 2 || order.status === 5 || order.status === 6 ||  order.status === 7 || order.status === 9) &&
                (
                  <span className='client-manager-orders__table-pending'>
                    Вы не можете взаимодействовать с этим заказом.
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className='client-manager-orders__create-title'>Создать новый заказ</h2>
      <form className='client-manager-orders__form' onSubmit={handleCreateOrder}>
        <label className='client-manager-orders__form-label'>
          Наименование:
          <input className='client-manager-orders__form-input' value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className='client-manager-orders__form-label'>
          Описание:
          <input className='client-manager-orders__form-input' value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className='client-manager-orders__form-label'>
          Габариты:
          <input className='client-manager-orders__form-input' value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
        </label>
        <label className='client-manager-orders__form-label'>
          Примеры:
          <input className='client-manager-orders__form-input' value={examples} onChange={(e) => setExamples(e.target.value)} />
        </label>
        <label className='client-manager-orders__form-label'>
          Клиент:
          <select className='client-manager-orders__form-select' value={clientId || ''} onChange={(e) => setClientId(parseInt(e.target.value, 10))}>
            <option value="">Выберите клиента</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name}
              </option>
            ))}
          </select>
        </label>
        <button className='client-manager-orders__form-button' type="submit">Создать заказ</button>
      </form>
    </div>
  )
}

export default OrderManagerPage

