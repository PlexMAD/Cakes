import React, { useEffect, useState } from 'react';

interface CakeDecoration {
    id: number;
    article: string;
    name: string;
    unit_of_measurement: string;
    quantity: number;
    main_supplier: string;
    image: string;
    decoration_type: string;
    purchase_price: string;
    weight: number;
    expiry_date?: string;
    [key: string]: any;
}

const DecorationsPage: React.FC = () => {
    const [decorations, setDecorations] = useState<CakeDecoration[]>([]);
    const [expiryDate, setExpiryDate] = useState('');
    const [totalCost, setTotalCost] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [uniqueDecorationTypes, setUniqueDecorationTypes] = useState<Set<string>>(new Set());
    const [editingDecoration, setEditingDecoration] = useState<CakeDecoration | null>(null);
    const [formData, setFormData] = useState<Partial<CakeDecoration>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchDecorations = async (expiryDate?: string) => {
        const url = expiryDate
            ? `http://127.0.0.1:8000/api/cakedecorations/search/?expiry_date=${expiryDate}`
            : 'http://127.0.0.1:8000/api/cakedecorations/';

        const response = await fetch(url);
        const data: CakeDecoration[] = await response.json();
        setDecorations(data);

        if (data.length > 0) {
            const cost = data.reduce((acc, decoration) => acc + parseFloat(decoration.purchase_price), 0);
            setTotalCost(cost);
            const types = new Set(data.map(decoration => decoration.decoration_type));
            setUniqueDecorationTypes(types);
        } else {
            setTotalCost(0);
            setUniqueDecorationTypes(new Set());
        }

        setTotalCount(data.length);
    };

    const handleEdit = (decoration: CakeDecoration) => {
        setEditingDecoration(decoration);
        setFormData({ ...decoration });
        setImageFile(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSend = new FormData();

        for (const key in formData) {
            formDataToSend.append(key, formData[key] as string);
        }

        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }

        if (editingDecoration) {
            await fetch(`http://127.0.0.1:8000/api/cakedecorations/${editingDecoration.id}/`, {
                method: 'PUT',
                body: formDataToSend,
            });
            setEditingDecoration(null);
            fetchDecorations(expiryDate);
        }
    };

    useEffect(() => {
        fetchDecorations(expiryDate);
    }, [expiryDate]);

    return (
        <div>
            <h1>Декорации для тортов</h1>
            <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
            />
            <h2>Всего записей: {totalCount}</h2>
            <h2>Уникальные типы декораций: {uniqueDecorationTypes.size}</h2>
            <h2>Общая стоимость: {totalCost} ₽</h2>

            {editingDecoration && (
                <form onSubmit={handleSubmit}>
                    <h3>Редактировать декорацию</h3>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        placeholder="Наименование"
                    />
                    <input
                        type="text"
                        name="article"
                        value={formData.article || ''}
                        onChange={handleChange}
                        placeholder="Артикул"
                    />
                    <input
                        type="text"
                        name="unit_of_measurement"
                        value={formData.unit_of_measurement || ''}
                        onChange={handleChange}
                        placeholder="Единица измерения"
                    />
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity || ''}
                        onChange={handleChange}
                        placeholder="Количество"
                    />
                    <input
                        type="text"
                        name="main_supplier"
                        value={formData.main_supplier || ''}
                        onChange={handleChange}
                        placeholder="Основной поставщик"
                    />
                    <input
                        type="text"
                        name="decoration_type"
                        value={formData.decoration_type || ''}
                        onChange={handleChange}
                        placeholder="Тип декорации"
                    />
                    <input
                        type="text"
                        name="purchase_price"
                        value={formData.purchase_price || ''}
                        onChange={handleChange}
                        placeholder="Закупочная цена"
                    />
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight || ''}
                        onChange={handleChange}
                        placeholder="Вес"
                    />
                    <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date || ''}
                        onChange={handleChange}
                        placeholder="Срок годности"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <button type="submit">Сохранить</button>
                    <button onClick={() => setEditingDecoration(null)}>Отменить</button>
                </form>
            )}

            <ul>
                {decorations.map((decoration) => (
                    <li key={decoration.id}>
                        <strong>Наименование:</strong> {decoration.name}<br />
                        <strong>Артикул:</strong> {decoration.article}<br />
                        <strong>Единица измерения:</strong> {decoration.unit_of_measurement}<br />
                        <strong>Количество:</strong> {decoration.quantity}<br />
                        <strong>Основной поставщик:</strong> {decoration.main_supplier}<br />
                        <strong>Тип декорации:</strong> {decoration.decoration_type}<br />
                        <strong>Закупочная цена:</strong> {decoration.purchase_price} ₽<br />
                        <strong>Вес:</strong> {decoration.weight} г<br />
                        <strong>Срок годности:</strong> {decoration.expiry_date || 'Нет данных'}<br />
                        {decoration.image && <img src={decoration.image} alt={decoration.name} style={{ width: '100px', height: '100px' }} />}
                        <button onClick={() => handleEdit(decoration)}>Редактировать</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DecorationsPage;
