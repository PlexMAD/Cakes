import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Problem {
    id: number;
    Equipment: number;
    equipment_name: string;
    occur_time: string;
    comment: string | null;
    end_time: string | null;
}

interface Equipment {
    id: number;
    description: string;
}

const EquipmentProblemPage: React.FC = () => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<number | ''>('');
    const [occurTime, setOccurTime] = useState<string>('');
    const [comment, setComment] = useState<string>('');

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/equipment/').then((response) => setEquipment(response.data));
        axios.get('http://127.0.0.1:8000/api/equip_problem/').then((response) => setProblems(response.data));
    }, []);

    const handleAddProblem = () => {
        if (!selectedEquipment || !occurTime) return;
        axios.post('http://127.0.0.1:8000/api/equip_problem/', {
            Equipment: selectedEquipment,
            occur_time: occurTime,
            comment: comment || null,
        }).then(() => {
            setOccurTime('');
            setSelectedEquipment('');
            setComment('');
            axios.get('http://127.0.0.1:8000/api/equip_problem/').then((response) => setProblems(response.data));
        });
    };

    const handleMarkResolved = (problemId: number) => {
        axios.patch(`http://127.0.0.1:8000/api/equip_problem/${problemId}/mark_resolved/`).then(() => {
            axios.get('http://127.0.0.1:8000/api/equip_problem/').then((response) => setProblems(response.data));
        });
    };

    return (
        <div className='equipment-problem'>
            <h1 className='equipment-problem__title'>Проблемы оборудования</h1>
            <div className='equipment-problem__add'>
                <h2 className='equipment-problem__subtitle'>Добавить проблему</h2>
                <select className='equipment-problem__select' value={selectedEquipment} onChange={(e) => setSelectedEquipment(Number(e.target.value))}>
                    <option value="">Выберите оборудование</option>
                    {equipment.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.description}
                        </option>
                    ))}
                </select>
                <input 
                    className='equipment-problem__input'
                    type="datetime-local"
                    value={occurTime}
                    onChange={(e) => setOccurTime(e.target.value)}
                />
                <textarea
                    className='equipment-problem__textarea'
                    placeholder="Введите комментарий (опционально)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button className='equipment-problem__button equipment-problem__button--add' onClick={handleAddProblem}>Добавить</button>
            </div>
            <div className='equipment-problem__list'>
                <h2 className='equipment-problem__subtitle'>Список проблем</h2>
                {problems.map((problem) => (
                    <div className='equipment-problem__item' key={problem.id}>
                        <p className='equipment-problem__description'>
                            Оборудование: {problem.equipment_name} | Начало сбоя: {problem.occur_time} | 
                            {problem.end_time ? `Исправлено: ${problem.end_time}` : 'Не исправлено'} | 
                            Комментарий: {problem.comment || 'Нет комментария'}
                        </p>
                        {!problem.end_time && (
                            <button className='equipment-problem__button equipment-problem__button--resolve' onClick={() => handleMarkResolved(problem.id)}>Отметить как исправленное</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EquipmentProblemPage;
