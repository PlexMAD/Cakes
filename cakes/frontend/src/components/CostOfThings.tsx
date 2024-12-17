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
interface Ingredient {
    id: number;
    name: string;
    quantity: number;
    purchase_price: number;
    main_supplier: number;
}
interface Decoration {
    id: number;
    name: string;
    quantity: number;
    purchase_price: number;
    main_supplier: number;
}
interface SemiProductSpec {
    id: number;
    quantity: number;
    product: number;
    semiproduct: number;
}

interface Supplier {
    id: number;
    address: string;
    delivery_deadline: string;
}

const CostOfThings: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [ingredientsSpec, setIngredientsSpec] = useState<IngredientSpec[]>([]);
    const [decorationsSpec, setDecorationsSpec] = useState<DecorationSpec[]>([]);
    const [semiProductsSpec, setSemiProductsSpec] = useState<SemiProductSpec[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [decorations, setDecorations] = useState<Decoration[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [
                    productResponse,
                    ingredientSpecResponse,
                    decorationSpecResponse,
                    semiProductSpecResponse,
                    ingredientResponse,
                    decorationResponse,
                    supplierResponse,
                ] = await Promise.all([
                    axios.get<Product[]>("http://127.0.0.1:8000/api/product/"),
                    axios.get<IngredientSpec[]>("http://127.0.0.1:8000/api/ingredient_spec/"),
                    axios.get<DecorationSpec[]>("http://127.0.0.1:8000/api/cakedecoration_spec/"),
                    axios.get<SemiProductSpec[]>("http://127.0.0.1:8000/api/semiproduct_spec/"),
                    axios.get<Ingredient[]>("http://127.0.0.1:8000/api/ingredients/"),
                    axios.get<Decoration[]>("http://127.0.0.1:8000/api/cakedecorations/"),
                    axios.get<Supplier[]>("http://127.0.0.1:8000/api/supplier/"),
                ]);
                setProducts(productResponse.data);
                setIngredientsSpec(ingredientSpecResponse.data);
                setDecorationsSpec(decorationSpecResponse.data);
                setSemiProductsSpec(semiProductSpecResponse.data);
                setIngredients(ingredientResponse.data);
                setDecorations(decorationResponse.data);
                setSuppliers(supplierResponse.data);
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
            }
        };
        fetchAll();
    }, []);

    const calculateShortage = (required: number, available: number) => Math.max(required - available, 0);

    const getDeliveryStatus = (supplierId: number) => {
        const supplier = suppliers.find((s) => s.id === supplierId);
        if (!supplier) return "Нет данных";

        const deliveryDate = new Date(supplier.delivery_deadline);
        const currentDate = new Date();

        return deliveryDate < currentDate ? "Доставлено" : deliveryDate.toLocaleDateString("ru-RU");
    };

    return (
        <div className="things">
            <h2 className="things__title">Оценка затрат ингредиентов, украшений и семипродуктов для тортов</h2>
            {products.map((product) => {
                const productIngredients = ingredientsSpec.filter((spec) => spec.product === product.id);
                const productDecorations = decorationsSpec.filter((spec) => spec.product === product.id);
                const productSemiProducts = semiProductsSpec.filter((spec) => spec.product === product.id);

                return (
                    <div className="things__item" key={product.id}>
                        <h3 className="things__table-title">Продукт: {product.name}</h3>
                        <table className="things__table">
                            <thead>
                                <tr>
                                    <th className="things__table-header">Наименование</th>
                                    <th className="things__table-header">Требуемое количество</th>
                                    <th className="things__table-header">Наличие на складе</th>
                                    <th className="things__table-header">Недостающее количество</th>
                                    <th className="things__table-header">Себестоимость</th>
                                    <th className="things__table-header">Статус доставки</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productIngredients.map((spec) => {
                                    const ingredient = ingredients.find((i) => i.id === spec.ingredient);
                                    if (!ingredient) return null;
                                    const shortage = calculateShortage(spec.quantity, ingredient.quantity);
                                    return (
                                        <tr className="things__table-row" key={`ingredient-${spec.id}`}>
                                            <td className="things__table-cell">{ingredient.name}</td>
                                            <td className="things__table-cell">{spec.quantity}</td>
                                            <td className="things__table-cell">{ingredient.quantity}</td>
                                            <td className="things__table-cell">{shortage}</td>
                                            <td className="things__table-cell">{ingredient.purchase_price * spec.quantity} руб.</td>
                                            <td className="things__table-cell">{getDeliveryStatus(ingredient.main_supplier)}</td>
                                        </tr>
                                    );
                                })}
                                {productDecorations.map((spec) => {
                                    const decoration = decorations.find((d) => d.id === spec.cake_decoration);
                                    if (!decoration) return null;
                                    const shortage = calculateShortage(spec.quantity, decoration.quantity);
                                    return (
                                        <tr className="things__table-row" key={`decoration-${spec.id}`}>
                                            <td className="things__table-cell">{decoration.name}</td>
                                            <td className="things__table-cell">{spec.quantity}</td>
                                            <td className="things__table-cell">{decoration.quantity}</td>
                                            <td className="things__table-cell">{shortage}</td>
                                            <td className="things__table-cell">{decoration.purchase_price * spec.quantity} руб.</td>
                                            <td className="things__table-cell">{getDeliveryStatus(decoration.main_supplier)}</td>
                                        </tr>
                                    );
                                })}
                                {productSemiProducts.map((spec) => {
                                    const semiProduct = products.find((p) => p.id === spec.semiproduct);
                                    if (!semiProduct) return null;
                                    return (
                                        <tr className="things__table-row" key={`semiproduct-${spec.id}`}>
                                            <td className="things__table-cell">{semiProduct.name}</td>
                                            <td className="things__table-cell">{spec.quantity}</td>
                                            <td className="things__table-cell">-</td>
                                            <td className="things__table-cell">-</td>
                                            <td className="things__table-cell">-</td>
                                            <td className="things__table-cell">-</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
};

export default CostOfThings;
