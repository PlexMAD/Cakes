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
}

const DecorationsPage: React.FC = () => {
    const [decorations, setDecorations] = useState<CakeDecoration[]>([]);
    const [expiryDate, setExpiryDate] = useState('');
    const [totalCost, setTotalCost] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [uniqueDecorationTypes, setUniqueDecorationTypes] = useState(new Set<string>());
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
        setTotalCost(data.reduce((acc, decoration) => acc + parseFloat(decoration.purchase_price), 0));
        setTotalCount(data.length);
        setUniqueDecorationTypes(new Set(data.map((d) => d.decoration_type)));
    };

    useEffect(() => {
        fetchDecorations(expiryDate);
    }, [expiryDate]);

    const handleEdit = (decoration: CakeDecoration) => {
        setEditingDecoration(decoration);
        setFormData({ ...decoration });
        setImageFile(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImageFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, String(formData[key as keyof CakeDecoration]));
        }
        if (imageFile) formDataToSend.append('image', imageFile);
        if (editingDecoration) {
            await fetch(`http://127.0.0.1:8000/api/cakedecorations/${editingDecoration.id}/`, {
                method: 'PUT',
                body: formDataToSend,
            });
            setEditingDecoration(null);
            fetchDecorations(expiryDate);
        }
    };

    return (
        <div className="decorations-page">
            <h1 className="decorations-page__title">Декорации для тортов</h1>
            <div className="decorations-page__filter">
                <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="decorations-page__date"
                />
            </div>
            <div className="decorations-page__info">
                <p>Всего записей: {totalCount}</p>
                <p>Уникальные типы декораций: {uniqueDecorationTypes.size}</p>
                <p>Общая стоимость: {totalCost} ₽</p>
            </div>
            <div className="decorations-page__grid">
                {decorations.map((decoration) => (
                    <div key={decoration.id} className="decoration-card">
                        <span className="decoration-card__quantity">
                            Количество: {decoration.quantity} шт
                        </span>
                        {decoration.image && (
                            <img src={decoration.image} alt={decoration.name} className="decoration-card__image" />
                        )}
                        <p className="decoration-card__name">{decoration.name}</p>
                        <p>Артикул: {decoration.article}</p>
                        <p>Основной поставщик: {decoration.main_supplier}</p>
                        <p>Тип декорации: {decoration.decoration_type}</p>
                        <p>Закупочная цена: {decoration.purchase_price} ₽</p>
                        <p>Вес: {decoration.weight} г</p>
                        <p>Срок годности: {decoration.expiry_date || 'Нет данных'}</p>
                        <div className="decoration-card__buttons">
                            <button onClick={() => handleEdit(decoration)} className="decoration-card__edit-button">
                                Редактировать
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {editingDecoration && (
                <form onSubmit={handleSubmit} className="decorations-page__edit-form">
                    <h3>Редактировать декорацию</h3>
                    <label>Наименование:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        placeholder="Наименование"
                    />
                    <label>Артикул:</label>
                    <input
                        type="text"
                        name="article"
                        value={formData.article || ''}
                        onChange={handleChange}
                        placeholder="Артикул"
                    />
                    <label>Единица измерения:</label>
                    <input
                        type="text"
                        name="unit_of_measurement"
                        value={formData.unit_of_measurement || ''}
                        onChange={handleChange}
                        placeholder="Единица измерения"
                    />
                    <label>Количество:</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity || ''}
                        onChange={handleChange}
                        placeholder="Количество"
                    />
                    <label>Основной поставщик:</label>
                    <input
                        type="text"
                        name="main_supplier"
                        value={formData.main_supplier || ''}
                        onChange={handleChange}
                        placeholder="Основной поставщик"
                    />
                    <label>Тип декорации:</label>
                    <input
                        type="text"
                        name="decoration_type"
                        value={formData.decoration_type || ''}
                        onChange={handleChange}
                        placeholder="Тип декорации"
                    />
                    <label>Закупочная цена:</label>
                    <input
                        type="text"
                        name="purchase_price"
                        value={formData.purchase_price || ''}
                        onChange={handleChange}
                        placeholder="Закупочная цена"
                    />
                    <label>Вес:</label>
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight || ''}
                        onChange={handleChange}
                        placeholder="Вес"
                    />
                    <label>Срок годности:</label>
                    <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date || ''}
                        onChange={handleChange}
                        placeholder="Срок годности"
                    />
                    <label>Изображение:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <button type="submit" className="decorations-page__save-button">Сохранить</button>
                    <button type="button" onClick={() => setEditingDecoration(null)} className="decorations-page__cancel-button">Отменить</button>
                </form>
            )}
        </div>
    );
};

export default DecorationsPage;
