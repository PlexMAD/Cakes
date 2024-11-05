import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Equipment {
    id: number;
    equipment_number: string;
    type: number;
    type_name: string;
}

interface EquipmentType {
    id: number;
    name: string;
}

const EquipmentPage: React.FC = () => {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<number | null>(null);
    const [equipmentNumber, setEquipmentNumber] = useState('');
    const [type, setType] = useState<number | ''>('');

    useEffect(() => {
        fetchEquipment();
        fetchEquipmentTypes();
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

    const handleEditClick = (equipment: Equipment) => {
        setSelectedEquipment(equipment.id);
        setEquipmentNumber(equipment.equipment_number);
        setType(equipment.type);
    };

    const handleSave = async () => {
        if (selectedEquipment) {
            try {
                await axios.put(`http://127.0.0.1:8000/api/equipment/${selectedEquipment}/`, {
                    equipment_number: equipmentNumber,
                    type: type,
                });
                setSelectedEquipment(null);
                fetchEquipment();
            } catch (error) {
                console.error('Error updating equipment:', error);
            }
        }
    };

    return (
        <div className="equipment">
            <h1 className="equipment__title">Список инвентаря</h1>
            <ul className="equipment__list">
                {equipmentList.map((equipment) => (
                    <li key={equipment.id} className="equipment__item">
                        {equipment.type_name} - {equipment.equipment_number}
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

                        <button onClick={handleSave} className="equipment__save-button">Сохранить</button>
                        <button onClick={() => setSelectedEquipment(null)} className="equipment__cancel-button">Отмена</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentPage;
