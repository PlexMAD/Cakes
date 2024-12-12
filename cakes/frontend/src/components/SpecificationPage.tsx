import React, { useEffect, useState } from "react";
import axios from "axios";
interface Product {
    id: number;
    name: string;
    size: string;
}
interface IngredientSpec {
    id: number,
    quantity: number,
    product: number,
    ingredient: number
}
interface DecorationSpec {
    id: number,
    quantity: number,
    product: number,
    cake_decoration: number
}
interface OperationSpec {
    id: number,
    quantity: number,
    product: number,
    cake_decoration: number
}
const SpecificationPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [ingredientsSpec, setIngredientsSpec] = useState<IngredientSpec[]>([])
    const [decorationsSpec, setDecorationsSpec] = useState<DecorationSpec[]>([])
    const [operationsSpec, setOperationsSpec] = useState<OperationSpec[]>([])
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [productResponse, ingredientSpecResponse, decorationSpecResponse, operationSpecResponse] = await Promise.all([
                    axios.get<Product[]>('http://127.0.0.1:8000/api/product/'),
                    axios.get<IngredientSpec[]>('http://127.0.0.1:8000/api/ingredient_spec/'),
                    axios.get<DecorationSpec[]>('http://127.0.0.1:8000/api/cakedecoration_spec/'),
                    axios.get<OperationSpec[]>('http://127.0.0.1:8000/api/operation_spec/'),
                ]);
                setProducts(productResponse.data)
                setIngredientsSpec(ingredientSpecResponse.data)
                setDecorationsSpec(decorationSpecResponse.data)
                setOperationsSpec(operationSpecResponse.data)
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };
        fetchAll()
    }, [])
    return (
        <div></div>
    )
}

export default SpecificationPage