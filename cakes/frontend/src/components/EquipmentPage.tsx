import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Equipment {
    id: number;
    equipment_number: string;
    type: number;
    type_name: string;
    purchase_date: string;
    quantity: number;
    description: string;
    durability: string;
    main_supplier: number | null;
}

interface EquipmentType {
    id: number;
    name: string;
}

interface Supplier {
    id: number;
    address: string;
    delivery_deadline: string;
}

const EquipmentPage: React.FC = () => {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
    const [equipmentNumber, setEquipmentNumber] = useState('');
    const [type, setType] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [durability, setDurability] = useState('');
    const [mainSupplier, setMainSupplier] = useState<number | ''>('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');

    useEffect(() => {
        fetchEquipment();
        fetchEquipmentTypes();
        fetchSuppliers();
    }, []);

    const fetchEquipment = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/equipment/');
            setEquipmentList(response.data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        }
    };

    const fetchEquipmentTypes = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/equipmenttype/');
            setEquipmentTypes(response.data);
        } catch (error) {
            console.error('Error fetching equipment types:', error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/supplier/');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const handleEditClick = (equipment: Equipment) => {
        setSelectedEquipment(equipment.id);
        setEquipmentNumber(equipment.equipment_number);
        setType(equipment.type);
        setDescription(equipment.description || '');
        setDurability(equipment.durability || '');
        setMainSupplier(equipment.main_supplier || '');
        setPurchaseDate(equipment.purchase_date || '');
        setQuantity(equipment.quantity);
    };

    const handleSave = async () => {
        if (selectedEquipment) {
            try {
                await axios.put(`http://127.0.0.1:8000/api/equipment/${selectedEquipment}/`, {
                    equipment_number: equipmentNumber,
                    type,
                    description,
                    durability,
                    main_supplier: mainSupplier,
                    purchase_date: new Date(purchaseDate).toISOString().split('T')[0],
                    quantity,
                });
                setSelectedEquipment(null);
                fetchEquipment();
            } catch (error) {
                console.error('Error updating equipment:', error);
            }
        }
    };
    const calculateEquipmentAge = (purchaseDate: string) => {
        const purchase = new Date(purchaseDate);
        const now = new Date();
        const ageInMonths = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth());
        return ageInMonths > 0 ? ageInMonths : 0;
    };

    const handleAddNewEquipment = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/equipment/', {
                equipment_number: equipmentNumber,
                type,
                description,
                durability,
                main_supplier: mainSupplier,
                purchase_date: new Date(purchaseDate).toISOString().split('T')[0],
                quantity,
            });
            fetchEquipment();
        } catch (error) {
            console.error('Error adding new equipment:', error);
        }
    };

    return (
        <div className="equipment">
            <h1 className="equipment__title">Список инвентаря</h1>
            <ul className="equipment__list">
                {equipmentList.map((equipment) => (
                    <li key={equipment.id} className="equipment__item">
                        {equipment.description} - {equipment.type_name} - Возраст: {calculateEquipmentAge(equipment.purchase_date)} мес. - Количество: {equipment.quantity}
                        <button
                            className="equipment__edit-button"
                            onClick={() => handleEditClick(equipment)}
                        >
                            Редактировать
                        </button>
                    </li>
                ))}
            </ul>

            {selectedEquipment && (
                <div className="equipment__edit-section">
                    <h2 className="equipment__edit-title">Редактировать инвентарь</h2>
                    <div className="equipment__form">
                        <label className="equipment__label">
                            Инвентарный номер:
                            <input
                                type="text"
                                value={equipmentNumber}
                                onChange={(e) => setEquipmentNumber(e.target.value)}
                                className="equipment__input"
                            />
                        </label>

                        <label className="equipment__label">
                            Тип:
                            <select
                                value={type}
                                onChange={(e) => setType(Number(e.target.value))}
                                className="equipment__select"
                            >
                                <option value="">Выберите тип</option>
                                {equipmentTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="equipment__label">
                            Описание:
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="equipment__input"
                            />
                        </label>

                        <label className="equipment__label">
                            Прочность:
                            <input
                                type="text"
                                value={durability}
                                onChange={(e) => setDurability(e.target.value)}
                                className="equipment__input"
                            />
                        </label>

                        <label className="equipment__label">
                            Поставщик:
                            <select
                                value={mainSupplier}
                                onChange={(e) => setMainSupplier(Number(e.target.value))}
                                className="equipment__select"
                            >
                                <option value="">Выберите поставщика</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.address}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="equipment__label">
                            Дата покупки:
                            <input
                                type="date"
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                className="equipment__input"
                            />
                        </label>

                        <label className="equipment__label">
                            Количество:
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="equipment__input"
                            />
                        </label>

                        <button onClick={handleSave} className="equipment__save-button">Сохранить</button>
                        <button onClick={() => setSelectedEquipment(null)} className="equipment__cancel-button">Отмена</button>
                    </div>
                </div>
            )}

            <h2 className="equipment__add-title">Добавить новое оборудование</h2>
            <div className="equipment__form">
                <label className="equipment__label">
                    Инвентарный номер:
                    <input
                        type="text"
                        value={equipmentNumber}
                        onChange={(e) => setEquipmentNumber(e.target.value)}
                        className="equipment__input"
                    />
                </label>

                <label className="equipment__label">
                    Тип:
                    <select
                        value={type}
                        onChange={(e) => setType(Number(e.target.value))}
                        className="equipment__select"
                    >
                        <option value="">Выберите тип</option>
                        {equipmentTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="equipment__label">
                    Описание:
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="equipment__input"
                    />
                </label>

                <label className="equipment__label">
                    Прочность:
                    <input
                        type="text"
                        value={durability}
                        onChange={(e) => setDurability(e.target.value)}
                        className="equipment__input"
                    />
                </label>

                <label className="equipment__label">
                    Поставщик:
                    <select
                        value={mainSupplier}
                        onChange={(e) => setMainSupplier(Number(e.target.value))}
                        className="equipment__select"
                    >
                        <option value="">Выберите поставщика</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.address}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="equipment__label">
                    Дата покупки:
                    <input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="equipment__input"
                    />
                </label>

                <label className="equipment__label">
                    Количество:
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="equipment__input"
                    />
                </label>

                <button onClick={handleAddNewEquipment} className="equipment__add-button">Добавить</button>
            </div>
        </div>
    );
};

export default EquipmentPage;
