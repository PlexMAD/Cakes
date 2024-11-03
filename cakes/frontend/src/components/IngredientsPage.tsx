import React, { useEffect, useState } from 'react';

interface Ingredient {
    id: number;
    article: string;
    name: string;
    unit_of_measure: string;
    quantity: number;
    main_supplier: string;
    image: string;
    ingredient_type: string;
    purchase_price: string;
    gost?: string;
    packing: string;
    characteristic?: string;
    expiry_date?: string;
    [key: string]: any;
}

const IngredientsPage: React.FC = () => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [expiryDate, setExpiryDate] = useState('');
    const [totalCost, setTotalCost] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [uniqueItemsCount, setUniqueItemsCount] = useState(0);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const [formData, setFormData] = useState<Partial<Ingredient>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchIngredients = async (expiryDate?: string) => {
        const url = expiryDate
            ? `http://127.0.0.1:8000/api/ingredients/search/?expiry_date=${expiryDate}`
            : 'http://127.0.0.1:8000/api/ingredients/';

        const response = await fetch(url);
        const data: Ingredient[] = await response.json();
        setIngredients(data);

        if (data.length > 0) {
            const cost = data.reduce((acc, ingredient) => acc + parseFloat(ingredient.purchase_price), 0);
            setTotalCost(cost);
        } else {
            setTotalCost(0);
        }

        setTotalCount(data.length);

        const uniqueNames = new Set(data.map(ingredient => ingredient.name));
        setUniqueItemsCount(uniqueNames.size);
    };

    const handleEdit = (ingredient: Ingredient) => {
        setEditingIngredient(ingredient);
        setFormData({ ...ingredient });
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

        if (editingIngredient) {
            await fetch(`http://127.0.0.1:8000/api/ingredients/${editingIngredient.id}/`, {
                method: 'PUT',
                body: formDataToSend,
            });
            setEditingIngredient(null);
            fetchIngredients(expiryDate);
        }
    };

    useEffect(() => {
        fetchIngredients(expiryDate);
    }, [expiryDate]);

    return (
        <div>
            <h1>Ингредиенты</h1>
            <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
            />
            <h2>Всего позиций: {totalCount}</h2>
            <h2>Уникальных позиций: {uniqueItemsCount}</h2>
            <h2>Общая стоимость: {totalCost} ₽</h2>

            {editingIngredient && (
                <form onSubmit={handleSubmit}>
                    <h3>Редактировать ингредиент</h3>
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
                        name="unit_of_measure"
                        value={formData.unit_of_measure || ''}
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
                        name="ingredient_type"
                        value={formData.ingredient_type || ''}
                        onChange={handleChange}
                        placeholder="Тип ингредиента"
                    />
                    <input
                        type="text"
                        name="purchase_price"
                        value={formData.purchase_price || ''}
                        onChange={handleChange}
                        placeholder="Закупочная цена"
                    />
                    <input
                        type="text"
                        name="gost"
                        value={formData.gost || ''}
                        onChange={handleChange}
                        placeholder="ГОСТ"
                    />
                    <input
                        type="text"
                        name="packing"
                        value={formData.packing || ''}
                        onChange={handleChange}
                        placeholder="Фасовка"
                    />
                    <input
                        type="text"
                        name="characteristic"
                        value={formData.characteristic || ''}
                        onChange={handleChange}
                        placeholder="Характеристика"
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
                    <button onClick={() => setEditingIngredient(null)}>Отменить</button>
                </form>
            )}

            <ul>
                {ingredients.map((ingredient) => (
                    <li key={ingredient.id}>
                        <strong>Наименование:</strong> {ingredient.name}<br />
                        <strong>Артикул:</strong> {ingredient.article}<br />
                        <strong>Единица измерения:</strong> {ingredient.unit_of_measure}<br />
                        <strong>Количество:</strong> {ingredient.quantity}<br />
                        <strong>Основной поставщик:</strong> {ingredient.main_supplier}<br />
                        <strong>Тип ингредиента:</strong> {ingredient.ingredient_type}<br />
                        <strong>Закупочная цена:</strong> {ingredient.purchase_price} ₽<br />
                        <strong>ГОСТ:</strong> {ingredient.gost || 'Не указано'}<br />
                        <strong>Фасовка:</strong> {ingredient.packing}<br />
                        <strong>Характеристика:</strong> {ingredient.characteristic || 'Нет данных'}<br />
                        <strong>Срок годности:</strong> {ingredient.expiry_date || 'Нет данных'}<br />
                        {ingredient.image && <img src={ingredient.image} alt={ingredient.name} style={{ width: '100px', height: '100px' }} />}
                        <button onClick={() => handleEdit(ingredient)}>Редактировать</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default IngredientsPage;
