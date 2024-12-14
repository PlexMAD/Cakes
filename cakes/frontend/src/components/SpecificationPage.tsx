import React, { useEffect, useState } from "react";
import axios from "axios";

interface Product {
    id: number;
    name: string;
    size: string;
}
interface IngredientSpec {
    id: number;
    quantity: number;
    product: number;
    ingredient: number;
}
interface DecorationSpec {
    id: number;
    quantity: number;
    product: number;
    cake_decoration: number;
}
interface SemiProductSpec {
    id: number;
    quantity: number;
    product: number;
    semiproduct: number;
}
interface OperationSpec {
    id: number;
    name: string;
    operation_number: number;
    product: number;
    equipment_type: number;
    time_required: number;
}
interface Ingredient {
    id: number;
    name: string;
}
interface Decoration {
    id: number;
    name: string;
}
interface EquipmentType {
    id: number;
    name: string;
}

const SpecificationPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [ingredientsSpec, setIngredientsSpec] = useState<IngredientSpec[]>([]);
    const [decorationsSpec, setDecorationsSpec] = useState<DecorationSpec[]>([]);
    const [operationsSpec, setOperationsSpec] = useState<OperationSpec[]>([]);
    const [semiProductsSpec, setSemiProductsSpec] = useState<SemiProductSpec[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [decorations, setDecorations] = useState<Decoration[]>([]);
    const [equipment, setEquipment] = useState<EquipmentType[]>([]);
    const [filter, setFilter] = useState<number | "">("");
    const [editedIngredientSpec, setEditedIngredientSpec] = useState<IngredientSpec | null>(null)
    const [editedDecorationSpec, setEditedDecorationSpec] = useState<DecorationSpec | null>(null)
    const [editedSemiSpec, setEditedSemiSpec] = useState<SemiProductSpec | null>(null)
    const [editedOperationSpec, setEditedOperationSpec] = useState<OperationSpec | null>(null)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [productResponse, ingredientSpecResponse, decorationSpecResponse, operationSpecResponse, semiProductSpecResponse, ingredientResponse, decorationResponse, equipmentResponse] = await Promise.all([
                    axios.get<Product[]>("http://127.0.0.1:8000/api/product/"),
                    axios.get<IngredientSpec[]>("http://127.0.0.1:8000/api/ingredient_spec/"),
                    axios.get<DecorationSpec[]>("http://127.0.0.1:8000/api/cakedecoration_spec/"),
                    axios.get<OperationSpec[]>("http://127.0.0.1:8000/api/operation_spec/"),
                    axios.get<SemiProductSpec[]>("http://127.0.0.1:8000/api/semiproduct_spec/"),
                    axios.get<Ingredient[]>("http://127.0.0.1:8000/api/ingredients/"),
                    axios.get<Decoration[]>("http://127.0.0.1:8000/api/cakedecorations/"),
                    axios.get<EquipmentType[]>("http://127.0.0.1:8000/api/equipmenttype/"),
                ]);
                setProducts(productResponse.data);
                setIngredientsSpec(ingredientSpecResponse.data);
                setDecorationsSpec(decorationSpecResponse.data);
                setOperationsSpec(operationSpecResponse.data);
                setSemiProductsSpec(semiProductSpecResponse.data);
                setIngredients(ingredientResponse.data);
                setDecorations(decorationResponse.data);
                setEquipment(equipmentResponse.data);
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
            }
        };
        fetchAll();
    }, []);

    const filteredProducts = filter
        ? products.filter((product) => product.id === filter)
        : products;

    const saveSpec = async (spec: IngredientSpec | SemiProductSpec | DecorationSpec | OperationSpec) => {
        console.log(spec)
        if ('ingredient' in spec) {
            await axios.patch(`http://127.0.0.1:8000/api/ingredient_spec/${spec.id}/`, {
                id: spec.id,
                quantity: spec.quantity,
                product: spec.product,
                ingredient: spec.ingredient
            })
        }
        else if ('cake_decoration' in spec) {
            await axios.patch(`http://127.0.0.1:8000/api/cakedecoration_spec/${spec.id}/`, {
                id: spec.id,
                quantity: spec.quantity,
                product: spec.product,
                cake_decoration: spec.cake_decoration
            })
        }
        else if ('semiproduct' in spec) {
            await axios.patch(`http://127.0.0.1:8000/api/semiproduct_spec/${spec.id}/`, {
                id: spec.id,
                quantity: spec.quantity,
                product: spec.product,
                semiproduct: spec.semiproduct
            })
        }
        else if ('equipment_type' in spec) {
            await axios.patch(`http://127.0.0.1:8000/api/operation_spec/${spec.id}/`, {
                id: spec.id,
                name: spec.name,
                operation_number: spec.operation_number,
                product: spec.product,
                equipment_type: spec.equipment_type,
                time_required: spec.time_required
            })
        }
        window.location.reload()
    }




    return (
        <div className="specifications">
            <h1 className="specifications__title">Спецификации</h1>

            <div className="specifications__filter">
                <label htmlFor="product-filter" className="filter__label">Фильтр по продукту: </label>
                <select
                    id="product-filter"
                    value={filter}
                    className="filter__select"
                    onChange={(e) => setFilter(e.target.value ? parseInt(e.target.value) : "")}
                >
                    <option value="">Все продукты</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
            </div>

            <h2 className="specifications__section-title">Ингредиенты</h2>
            <ul className="specifications__list">
                {ingredientsSpec
                    .filter((spec) => filteredProducts.some((product) => product.id === spec.product))
                    .map((spec) => (
                        <div className="specifications__item-info">
                            <li className="specifications__item" key={spec.id}>
                                <span className="item-info__text">
                                    Продукт: {products.find((p) => p.id === spec.product)?.name || "Неизвестно"},
                                </span>
                                <span className="item-info__text">
                                    Ингредиент: {ingredients.find((i) => i.id === spec.ingredient)?.name || "Неизвестно"},
                                </span>
                                <span className="item-info__text">
                                    Количество: {spec.quantity}
                                </span>
                            </li>
                            <button className="specifications__button specifications__button--edit" onClick={() => setEditedIngredientSpec(spec)}>Редактировать</button>
                        </div>
                    ))}
            
                {editedIngredientSpec && (
                    <div className="specifications__editor">
                        <h3 className="editor__title">Редактирование спецификации ингредиентов</h3>
                        <select value={editedIngredientSpec?.product} id="selectProduct" className="editor__select" onChange={(e) => setEditedIngredientSpec({
                            ...editedIngredientSpec,
                            product: parseInt(e.target.value),
                        })}>
                            {products.map((product) => (
                                <option value={product.id}>{product.name}</option>
                            ))}
                        </select>
                        <select value={editedIngredientSpec?.ingredient} id="selectIngredient" className="editor__select" onChange={(e) => setEditedIngredientSpec({
                            ...editedIngredientSpec,
                            ingredient: parseInt(e.target.value),
                        })}>
                            {ingredients.map((ingredient) => (
                                <option value={ingredient.id}>{ingredient.name}</option>
                            ))}
                        </select>
                        <input type='number' value={editedIngredientSpec?.quantity} className="editor__select" onChange={(e) => setEditedIngredientSpec({ ...editedIngredientSpec, quantity: parseInt(e.target.value) })}></input>
                        <button className="editor__button editor__button--cancel" onClick={() => setEditedIngredientSpec(null)}>Отмена</button>
                        <button className="editor__button editor__button--save" onClick={() => { saveSpec(editedIngredientSpec) }}>Сохранить</button>
                    </div>
                )}
            </ul>


            <h2 className="specifications__section-title">Украшения</h2>
            <ul className="specifications__list">
                {decorationsSpec
                    .filter((spec) => filteredProducts.some((product) => product.id === spec.product))
                    .map((spec) => (
                        <div className="specifications__item-info">
                            <li className="specifications__item" key={spec.id}>
                                <span className="item-info__text">
                                    Продукт: {products.find((p) => p.id === spec.product)?.name || "Неизвестно"},
                                </span>
                                <span className="item-info__text">
                                    Украшение: {decorations.find((d) => d.id === spec.cake_decoration)?.name || "Неизвестно"},
                                </span>
                                <span className="item-info__text">
                                    Количество: {spec.quantity}
                                </span>
                            </li>
                            <button className="specifications__button specifications__button--edit" onClick={() => setEditedDecorationSpec(spec)}>Редактировать</button>
                        </div>
                    ))}
                {editedDecorationSpec && (
                    <div className="specifications__editor">
                        <h3 className="editor__title">Редактирование спецификации декораций</h3>
                        <select value={editedDecorationSpec?.product} id="selectProduct" className="editor__select" onChange={(e) => setEditedDecorationSpec({
                            ...editedDecorationSpec,
                            product: parseInt(e.target.value),
                        })}>
                            {products.map((product) => (
                                <option value={product.id}>{product.name}</option>
                            ))}
                        </select>
                        <select value={editedDecorationSpec?.cake_decoration} id="selectIngredient" className="editor__select" onChange={(e) => setEditedDecorationSpec({
                            ...editedDecorationSpec,
                            cake_decoration: parseInt(e.target.value),
                        })}>
                            {decorations.map((decoration) => (
                                <option value={decoration.id}>{decoration.name}</option>
                            ))}
                        </select>
                        <input type='number' value={editedDecorationSpec?.quantity} className="editor__select" onChange={(e) => setEditedDecorationSpec({ ...editedDecorationSpec, quantity: parseInt(e.target.value) })}></input>
                        <button className="editor__button editor__button--cancel" onClick={() => setEditedDecorationSpec(null)}>Отмена</button>
                        <button className="editor__button editor__button--save" onClick={() => { saveSpec(editedDecorationSpec) }}>Сохранить</button>
                    </div>
                )}
            </ul>

            <h2 className="specifications__section-title">Операции</h2>
            <ul className="specifications__list">
                {operationsSpec
                    .filter((spec) => filteredProducts.some((product) => product.id === spec.product))
                    .map((spec) => (
                        <div className="specifications__item-info">
                            <li className="specifications__item" key={spec.id}>
                                <span className="item-info__text">
                                    Продукт: {products.find((p) => p.id === spec.product)?.name || "Неизвестно"},
                                </span>
                                <span className="item-info__text">
                                    Операция: {spec.name},
                                </span>
                                <span className="item-info__text">
                                    Номер операции: {spec.operation_number},
                                </span>
                                <span className="item-info__text">
                                    Оборудование: {equipment.find((e) => e.id === spec.equipment_type)?.name || "Неизвестно"},
                                </span>
                                <span className="item-info__text">
                                    Требуемое время: {spec.time_required}
                                </span>
                            </li>
                            <button className="specifications__button specifications__button--edit" onClick={() => setEditedOperationSpec(spec)}>Редактировать</button>
                        </div>
                    ))}
            </ul>
            {editedOperationSpec && (
                <div className="specifications__editor">
                    <h3 className="editor__title">Редактирование спецификации операций</h3>
                    <select
                        value={editedOperationSpec.product}
                        className="editor__select"
                        onChange={(e) =>
                            setEditedOperationSpec({
                                ...editedOperationSpec,
                                product: parseInt(e.target.value),
                            })
                        }
                    >
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={editedOperationSpec.name}
                        className="editor__select"
                        onChange={(e) =>
                            setEditedOperationSpec({ ...editedOperationSpec, name: e.target.value })
                        }
                    />
                    <input
                        type="number"
                        value={editedOperationSpec.operation_number}
                        className="editor__select"
                        onChange={(e) =>
                            setEditedOperationSpec({
                                ...editedOperationSpec,
                                operation_number: parseInt(e.target.value),
                            })
                        }
                    />
                    <select
                        value={editedOperationSpec.equipment_type}
                        className="editor__select"
                        onChange={(e) =>
                            setEditedOperationSpec({
                                ...editedOperationSpec,
                                equipment_type: parseInt(e.target.value),
                            })
                        }
                    >
                        {equipment.map((equip) => (
                            <option key={equip.id} value={equip.id}>
                                {equip.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={editedOperationSpec.time_required}
                        className="editor__select"
                        onChange={(e) =>
                            setEditedOperationSpec({
                                ...editedOperationSpec,
                                time_required: parseInt(e.target.value),
                            })
                        }
                    />
                    <button className="editor__button editor__button--save" onClick={() => saveSpec(editedOperationSpec)}>Сохранить</button>
                    <button className="editor__button editor__button--cancel" onClick={() => setEditedOperationSpec(null)}>Отмена</button>
                </div>
            )}

            <h2 className="specifications__section-title">Полупродукты</h2>
            <ul className="specifications__list">
                {semiProductsSpec
                    .filter((spec) => filteredProducts.some((product) => product.id === spec.product))
                    .map((spec) => (
                        <div className="specifications__item-info">
                            <li className="specifications__item" key={spec.id}>
                                <span className="item-info__text">
                                    Продукт: {products.find((p) => p.id === spec.product)?.name || "Неизвестно"},
                                </span>
                                <span className="item-info__text">
                                    Полупродукт: {products.find((p) => p.id === spec.semiproduct)?.name || "Неизвестно"},
                                </span>
                                <span className="item-info__text">
                                    Количество: {spec.quantity}
                                </span>
                            </li>
                            <button className="specifications__button specifications__button--edit" onClick={() => setEditedSemiSpec(spec)}>Редактировать</button>
                        </div>
                    ))}
            </ul>
            {editedSemiSpec && (
                <div className="specifications__editor">
                    <h3 className="editor__title">Редактирование спецификации полупродуктов</h3>
                    <select value={editedSemiSpec?.product} id="selectProduct" className="editor__select" onChange={(e) => setEditedSemiSpec({
                        ...editedSemiSpec,
                        product: parseInt(e.target.value),
                    })}>
                        {products.map((product) => (
                            <option value={product.id}>{product.name}</option>
                        ))}
                    </select>
                    <select value={editedSemiSpec?.semiproduct} id="selectIngredient" className="editor__select" onChange={(e) => setEditedSemiSpec({
                        ...editedSemiSpec,
                        semiproduct: parseInt(e.target.value),
                    })}>
                        {products.map((product) => (
                            <option value={product.id}>{product.name}</option>
                        ))}
                    </select>
                    <input type='number' value={editedSemiSpec?.quantity} className="editor__select" onChange={(e) => setEditedSemiSpec({ ...editedSemiSpec, quantity: parseInt(e.target.value) })}></input>
                    <button className="editor__button editor__button--cancel" onClick={() => setEditedSemiSpec(null)}>Отмена</button>
                    <button className="editor__button editor__button--save" onClick={() => { saveSpec(editedSemiSpec) }}>Сохранить</button>
                </div>
            )}
        </div>
    );
};

export default SpecificationPage;
