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

        const cost = data.reduce((acc, ingredient) => acc + parseFloat(ingredient.purchase_price), 0);
        setTotalCost(cost);
        setTotalCount(data.length);
        setUniqueItemsCount(new Set(data.map(item => item.name)).size);
    };

    useEffect(() => {
        fetchIngredients(expiryDate);
    }, [expiryDate]);

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
            const typedKey = key as keyof Ingredient;
            if (formData[typedKey] !== undefined && formData[typedKey] !== null) {
                formDataToSend.append(key, String(formData[typedKey]));
            }
        }

        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }

        if (editingIngredient) {
            const response = await fetch(`http://127.0.0.1:8000/api/ingredients/${editingIngredient.id}/`, {
                method: 'PUT',
                body: formDataToSend,
            });

            if (response.ok) {
                const updatedIngredient: Ingredient = await response.json();
                
                setIngredients(prevIngredients =>
                    prevIngredients.map(ingredient =>
                        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
                    )
                );
                
                setEditingIngredient(null);
            } else {
                console.error("Ошибка при обновлении ингредиента");
            }
        }
    };

    return (
        <div className="ingredients-page">
            <h1 className="ingredients-page__title">Ингредиенты</h1>
            <div className="ingredients-page__filter">
                <label>Фильтр:</label>
                <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="ingredients-page__date"
                />
            </div>
            <div className="ingredients-page__info">
                <p>Всего позиций: {totalCount}</p>
                <p>Уникальных позиций: {uniqueItemsCount}</p>
                <p>Общая стоимость: {totalCost} ₽</p>
            </div>
            <div className="ingredients-page__grid">
                {ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="ingredient-card">
                        <p className="ingredient-card__quantity">Количество: {ingredient.quantity} шт</p>
                        {ingredient.image && (
                            <img src={ingredient.image} alt={ingredient.name} className="ingredient-card__image" />
                        )}
                        <p className="ingredient-card__name">{ingredient.name}</p>
                        <p className="ingredient-card__article">Артикул: {ingredient.article}</p>
                        <p className="ingredient-card__measure">Единица измерения: {ingredient.unit_of_measure}</p>
                        <p className="ingredient-card__supplier">Основной поставщик: {ingredient.main_supplier}</p>
                        <p className="ingredient-card__type">Тип ингредиента: {ingredient.ingredient_type}</p>
                        {ingredient.gost && <p className="ingredient-card__gost">ГОСТ: {ingredient.gost}</p>}
                        {ingredient.packing && <p className="ingredient-card__packing">Фасовка: {ingredient.packing}</p>}
                        {ingredient.characteristic && <p className="ingredient-card__characteristic">Характеристика: {ingredient.characteristic}</p>}
                        <p className="ingredient-card__expiry">Срок годности: {ingredient.expiry_date}</p>
                        <p className="ingredient-card__price">Закупочная цена: {ingredient.purchase_price} ₽</p>
                        <div className="ingredient-card__buttons">
                            <button
                                className="ingredient-card__edit-button"
                                onClick={() => handleEdit(ingredient)}
                            >
                                Редактировать
                            </button>
                            {/* <button className="ingredient-card__delete-button">Удалить</button> */}
                        </div>
                    </div>
                ))}
            </div>

            {editingIngredient && (
                <form onSubmit={handleSubmit} className="ingredients-page__edit-form">
                    <h3>Редактировать ингредиент</h3>
                    <label>Наименование:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Артикул:</label>
                    <input
                        type="text"
                        name="article"
                        value={formData.article || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Единица измерения:</label>
                    <input
                        type="text"
                        name="unit_of_measure"
                        value={formData.unit_of_measure || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Количество:</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Основной поставщик:</label>
                    <input
                        type="text"
                        name="main_supplier"
                        value={formData.main_supplier || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Тип ингредиента:</label>
                    <input
                        type="text"
                        name="ingredient_type"
                        value={formData.ingredient_type || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Закупочная цена:</label>
                    <input
                        type="text"
                        name="purchase_price"
                        value={formData.purchase_price || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>ГОСТ:</label>
                    <input
                        type="text"
                        name="gost"
                        value={formData.gost || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Фасовка:</label>
                    <input
                        type="text"
                        name="packing"
                        value={formData.packing || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Характеристика:</label>
                    <input
                        type="text"
                        name="characteristic"
                        value={formData.characteristic || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Срок годности:</label>
                    <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date || ''}
                        onChange={handleChange}
                        className="ingredients-page__input"
                    />
                    <label>Изображение:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="ingredients-page__file-input"
                    />
                    <button type="submit" className="ingredients-page__save-button">Сохранить</button>
                    <button type="button" onClick={() => setEditingIngredient(null)} className="ingredients-page__cancel-button">Отменить</button>
                </form>
            )}
        </div>
    );
};

export default IngredientsPage;
