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
    <div>
      <table>
        <thead>
          <tr>
            <th>Номер</th>
            <th>Дата</th>
            <th>Наименование</th>
            <th>Статус</th>
            <th>Стоимость</th>
            <th>Дата выполнения</th>
            <th>Имя заказчика</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {userOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.number}</td>
              <td>{order.date}</td>
              <td>{order.name}</td>
              <td>{statuses[order.status] || 'Неизвестно'}</td>
              <td>{order.price}</td>
              <td>{order.deadline}</td>
              <td>{users[order.buyer] || 'Неизвестно'}</td>
              <td>
                {order.status === 1 && (
                  <button onClick={() => handleAcceptOrder(order.id)}>Принять</button>
                )}
                {(order.status === 1 || order.status === 4) && (
                  <button onClick={() => handleCancelOrder(order.id)}>Отменить заказ</button>
                )}
                {(order.status === 3) && (
                  <button onClick={() => handleFinalAcceptOrder(order.id)}>Отправить на подтверждение</button>
                )}
                {(order.status === 4) && (
                  <button onClick={() => handleApproveZakupkaOrder(order.id)}>Отправить на закупку</button>
                )}
                {(order.status === 8) && (
                  <button onClick={() => handleDoOrder(order.id)}>Выполнить</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Создать новый заказ</h2>
      <form onSubmit={handleCreateOrder}>
        <label>
          Наименование:
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Описание:
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Габариты:
          <input value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
        </label>
        <label>
          Примеры:
          <input value={examples} onChange={(e) => setExamples(e.target.value)} />
        </label>
        <label>
          Клиент:
          <select value={clientId || ''} onChange={(e) => setClientId(parseInt(e.target.value, 10))}>
            <option value="">Выберите клиента</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Создать заказ</button>
      </form>
    </div>
  )
}

export default OrderManagerPage

