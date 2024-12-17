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
        <div>
            <h2>Оценка затрат ингредиентов, украшений и семипродуктов для тортов</h2>
            {products.map((product) => {
                const productIngredients = ingredientsSpec.filter((spec) => spec.product === product.id);
                const productDecorations = decorationsSpec.filter((spec) => spec.product === product.id);
                const productSemiProducts = semiProductsSpec.filter((spec) => spec.product === product.id);

                return (
                    <div key={product.id}>
                        <h3>Торт: {product.name}</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Наименование</th>
                                    <th>Требуемое количество</th>
                                    <th>Наличие на складе</th>
                                    <th>Недостающее количество</th>
                                    <th>Себестоимость</th>
                                    <th>Статус доставки</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productIngredients.map((spec) => {
                                    const ingredient = ingredients.find((i) => i.id === spec.ingredient);
                                    if (!ingredient) return null;
                                    const shortage = calculateShortage(spec.quantity, ingredient.quantity);
                                    return (
                                        <tr key={`ingredient-${spec.id}`}>
                                            <td>{ingredient.name}</td>
                                            <td>{spec.quantity}</td>
                                            <td>{ingredient.quantity}</td>
                                            <td>{shortage}</td>
                                            <td>{ingredient.purchase_price * spec.quantity} руб.</td>
                                            <td>{getDeliveryStatus(ingredient.main_supplier)}</td>
                                        </tr>
                                    );
                                })}
                                {productDecorations.map((spec) => {
                                    const decoration = decorations.find((d) => d.id === spec.cake_decoration);
                                    if (!decoration) return null;
                                    const shortage = calculateShortage(spec.quantity, decoration.quantity);
                                    return (
                                        <tr key={`decoration-${spec.id}`}>
                                            <td>{decoration.name}</td>
                                            <td>{spec.quantity}</td>
                                            <td>{decoration.quantity}</td>
                                            <td>{shortage}</td>
                                            <td>{decoration.purchase_price * spec.quantity} руб.</td>
                                            <td>{getDeliveryStatus(decoration.main_supplier)}</td>
                                        </tr>
                                    );
                                })}
                                {productSemiProducts.map((spec) => {
                                    const semiProduct = products.find((p) => p.id === spec.semiproduct);
                                    if (!semiProduct) return null;
                                    return (
                                        <tr key={`semiproduct-${spec.id}`}>
                                            <td>{semiProduct.name}</td>
                                            <td>{spec.quantity}</td>
                                            <td>-</td>
                                            <td>-</td>
                                            <td>-</td>
                                            <td>-</td>
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
