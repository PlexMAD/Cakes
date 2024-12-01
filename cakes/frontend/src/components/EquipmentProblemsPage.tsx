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
        <div>
            <h1>Проблемы оборудования</h1>
            <div>
                <h2>Добавить проблему</h2>
                <select value={selectedEquipment} onChange={(e) => setSelectedEquipment(Number(e.target.value))}>
                    <option value="">Выберите оборудование</option>
                    {equipment.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.description}
                        </option>
                    ))}
                </select>
                <input
                    type="datetime-local"
                    value={occurTime}
                    onChange={(e) => setOccurTime(e.target.value)}
                />
                <textarea
                    placeholder="Введите комментарий (опционально)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <button onClick={handleAddProblem}>Добавить</button>
            </div>
            <div>
                <h2>Список проблем</h2>
                {problems.map((problem) => (
                    <div key={problem.id}>
                        <p>
                            Оборудование: {problem.equipment_name} | Начало сбоя: {problem.occur_time} | 
                            {problem.end_time ? `Исправлено: ${problem.end_time}` : 'Не исправлено'} | 
                            Комментарий: {problem.comment || 'Нет комментария'}
                        </p>
                        {!problem.end_time && (
                            <button onClick={() => handleMarkResolved(problem.id)}>Отметить как исправленное</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EquipmentProblemPage;
