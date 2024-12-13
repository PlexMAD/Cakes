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
        <div>
            <h1>Спецификации</h1>

            <div>
                <label htmlFor="product-filter">Фильтр по продукту: </label>
                <select
                    id="product-filter"
                    value={filter}
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

            <h2>Ингредиенты</h2>
            <ul>
                {ingredientsSpec
                    .filter((spec) => filteredProducts.some((product) => product.id === spec.product))
                    .map((spec) => (
                        <div>
                            <li key={spec.id}>
                                Продукт: {products.find((p) => p.id === spec.product)?.name || "Неизвестно"},
                                Ингредиент: {ingredients.find((i) => i.id === spec.ingredient)?.name || "Неизвестно"},
                                Количество: {spec.quantity}
                            </li>
                            <button onClick={() => setEditedIngredientSpec(spec)}>Редактировать</button>
                        </div>
                    ))}
                {editedIngredientSpec && (
                    <div>
                        <h3>Редактирование спецификации ингредиентов</h3>
                        <select value={editedIngredientSpec?.product} id="selectProduct" onChange={(e) => setEditedIngredientSpec({
                            ...editedIngredientSpec,
                            product: parseInt(e.target.value),
                        })}>
                            {products.map((product) => (
                                <option value={product.id}>{product.name}</option>
                            ))}
                        </select>
                        <select value={editedIngredientSpec?.ingredient} id="selectIngredient" onChange={(e) => setEditedIngredientSpec({
                            ...editedIngredientSpec,
                            ingredient: parseInt(e.target.value),
                        })}>
                            {ingredients.map((ingredient) => (
                                <option value={ingredient.id}>{ingredient.name}</option>
                            ))}
                        </select>
                        <input type='number' value={editedIngredientSpec?.quantity} onChange={(e) => setEditedIngredientSpec({ ...editedIngredientSpec, quantity: parseInt(e.target.value) })}></input>
                        <button onClick={() => { saveSpec(editedIngredientSpec) }}>Сохранить</button>
                    </div>
                )}
            </ul>


            <h2>Украшения</h2>
            <ul>
                {decorationsSpec
                    .filter((spec) => filteredProducts.some((product) => product.id === spec.product))
                    .map((spec) => (
                        <div>
                            <li key={spec.id}>
                                Продукт: {products.find((p) => p.id === spec.product)?.name || "Неизвестно"},
                                Украшение: {decorations.find((d) => d.id === spec.cake_decoration)?.name || "Неизвестно"},
                                Количество: {spec.quantity}
                            </li>
                            <button onClick={() => setEditedDecorationSpec(spec)}>Редактировать</button>
                        </div>
                    ))}
                {editedDecorationSpec && (
                    <div>
                        <h3>Редактирование спецификации декораций</h3>
                        <select value={editedDecorationSpec?.product} id="selectProduct" onChange={(e) => setEditedDecorationSpec({
                            ...editedDecorationSpec,
                            product: parseInt(e.target.value),
                        })}>
                            {products.map((product) => (
                                <option value={product.id}>{product.name}</option>
                            ))}
                        </select>
                        <select value={editedDecorationSpec?.cake_decoration} id="selectIngredient" onChange={(e) => setEditedDecorationSpec({
                            ...editedDecorationSpec,
                            cake_decoration: parseInt(e.target.value),
                        })}>
                            {decorations.map((decoration) => (
                                <option value={decoration.id}>{decoration.name}</option>
                            ))}
                        </select>
                        <input type='number' value={editedDecorationSpec?.quantity} onChange={(e) => setEditedDecorationSpec({ ...editedDecorationSpec, quantity: parseInt(e.target.value) })}></input>
                        <button onClick={() => { saveSpec(editedDecorationSpec) }}>Сохранить</button>
                    </div>
                )}
            </ul>

            <h2>Операции</h2>
            <ul>
                {operationsSpec
                    .filter((spec) => filteredProducts.some((product) => product.id === spec.product))
                    .map((spec) => (
                        <div>
                            <li key={spec.id}>
                                Продукт: {products.find((p) => p.id === spec.product)?.name || "Неизвестно"},
                                Операция: {spec.name},
                                Номер операции: {spec.operation_number},
                                Оборудование: {equipment.find((e) => e.id === spec.equipment_type)?.name || "Неизвестно"},
                                Требуемое время: {spec.time_required}
                            </li>
                            <button onClick={() => setEditedOperationSpec(spec)}>Редактировать</button>
                        </div>
                    ))}
            </ul>
            {editedOperationSpec && (
                <div>
                    <h3>Редактирование спецификации операций</h3>
                    <select
                        value={editedOperationSpec.product}
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
                        onChange={(e) =>
                            setEditedOperationSpec({ ...editedOperationSpec, name: e.target.value })
                        }
                    />
                    <input
                        type="number"
                        value={editedOperationSpec.operation_number}
                        onChange={(e) =>
                            setEditedOperationSpec({
                                ...editedOperationSpec,
                                operation_number: parseInt(e.target.value),
                            })
                        }
                    />
                    <select
                        value={editedOperationSpec.equipment_type}
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
                        onChange={(e) =>
                            setEditedOperationSpec({
                                ...editedOperationSpec,
                                time_required: parseInt(e.target.value),
                            })
                        }
                    />
                    <button onClick={() => saveSpec(editedOperationSpec)}>Сохранить</button>
                    <button onClick={() => setEditedOperationSpec(null)}>Отмена</button>
                </div>
            )}

            <h2>Полупродукты</h2>
            <ul>
                {semiProductsSpec
                    .filter((spec) => filteredProducts.some((product) => product.id === spec.product))
                    .map((spec) => (
                        <div>
                            <li key={spec.id}>
                                Продукт: {products.find((p) => p.id === spec.product)?.name || "Неизвестно"},
                                Полупродукт: {products.find((p) => p.id === spec.semiproduct)?.name || "Неизвестно"},
                                Количество: {spec.quantity}
                            </li>
                            <button onClick={() => setEditedSemiSpec(spec)}>Редактировать</button>
                        </div>
                    ))}
            </ul>
            {editedSemiSpec && (
                <div>
                    <h3>Редактирование спецификации полупродуктов</h3>
                    <select value={editedSemiSpec?.product} id="selectProduct" onChange={(e) => setEditedSemiSpec({
                        ...editedSemiSpec,
                        product: parseInt(e.target.value),
                    })}>
                        {products.map((product) => (
                            <option value={product.id}>{product.name}</option>
                        ))}
                    </select>
                    <select value={editedSemiSpec?.semiproduct} id="selectIngredient" onChange={(e) => setEditedSemiSpec({
                        ...editedSemiSpec,
                        semiproduct: parseInt(e.target.value),
                    })}>
                        {products.map((product) => (
                            <option value={product.id}>{product.name}</option>
                        ))}
                    </select>
                    <input type='number' value={editedSemiSpec?.quantity} onChange={(e) => setEditedSemiSpec({ ...editedSemiSpec, quantity: parseInt(e.target.value) })}></input>
                    <button onClick={() => { saveSpec(editedSemiSpec) }}>Сохранить</button>
                </div>
            )}
        </div>
    );
};

export default SpecificationPage;
