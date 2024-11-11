import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface MapPoint {
  id: number;
  x_axis?: number;
  y_axis?: number;
  image?: string | null;
  map_point?: number;
}

interface Workshop {
  id: number;
  name: string;
}

const RescueMap: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<number | null>(null);
  const [workshopPoints, setWorkshopPoints] = useState<MapPoint[]>([]);
  const [availablePoints, setAvailablePoints] = useState<MapPoint[]>([]);
  const [selectedPointForPlacement, setSelectedPointForPlacement] = useState<MapPoint | null>(null);
  const [grid, setGrid] = useState<(MapPoint | null)[][]>(Array.from({ length: 10 }, () => Array(10).fill(null)));

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/workshop/')
      .then(response => setWorkshops(response.data as Workshop[]));
    axios.get('http://127.0.0.1:8000/api/points/')
      .then(response => setAvailablePoints(response.data as MapPoint[]));
  }, []);

  const selectWorkshop = async (workshopId: number) => {
    setSelectedWorkshop(workshopId);

    const response = await axios.get(`http://127.0.0.1:8000/api/workshop_points/?workshop=${workshopId}`);

    const pointsWithImages = response.data.map((point: MapPoint) => {
      const pointImage = availablePoints.find(p => p.id === point.map_point)?.image;
      return {
        ...point,
        image: pointImage || 'default_image_url'
      };
    });

    setWorkshopPoints(pointsWithImages);

    const newGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
    pointsWithImages.forEach((point: MapPoint) => {
      if (point.x_axis !== undefined && point.y_axis !== undefined && point.x_axis >= 0 && point.x_axis < 10 && point.y_axis >= 0 && point.y_axis < 10) {
        newGrid[point.x_axis][point.y_axis] = point;
      }
    });
    setGrid(newGrid);
  };

  const movePoint = (pointId: number, x: number, y: number) => {
    const updatedGrid = grid.map(row => row.map(cell => (cell && cell.id === pointId ? null : cell)));
    updatedGrid[x][y] = workshopPoints.find(point => point.id === pointId) || null;
    setGrid(updatedGrid);
    axios.patch(`http://127.0.0.1:8000/api/workshop_points/${pointId}/`, { x_axis: x, y_axis: y });
  };

  const deletePoint = (pointId: number) => {
    setWorkshopPoints(workshopPoints.filter(point => point.id !== pointId));
    setGrid(grid.map(row => row.map(cell => (cell && cell.id === pointId ? null : cell))));
    axios.delete(`http://127.0.0.1:8000/api/workshop_points/${pointId}/`);
  };

  const addPointToGrid = (x: number, y: number) => {
    if (!selectedPointForPlacement || grid[x][y]) return;
    setWorkshopPoints([...workshopPoints, selectedPointForPlacement]);
    const updatedGrid = [...grid];
    updatedGrid[x][y] = selectedPointForPlacement;
    setGrid(updatedGrid);
    axios.post(`http://127.0.0.1:8000/api/workshop_points/`, {
      workshop: selectedWorkshop,
      map_point: selectedPointForPlacement.id,
      x_axis: x,
      y_axis: y
    });
    setSelectedPointForPlacement(null);
  };

  const handlePointClick = (point: MapPoint) => {
    if (point) {
      deletePoint(point.id);
    }
  };

  return (
    <div>
      <h1>Select a Workshop</h1>
      <ul>
        {workshops.map(workshop => (
          <li key={workshop.id} onClick={() => selectWorkshop(workshop.id)}>
            {workshop.name}
          </li>
        ))}
      </ul>
      {selectedWorkshop && (
        <div>
          <h2>Map for Workshop {selectedWorkshop}</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 50px)', gap: '5px' }}>
              {grid.map((row, rowIndex) =>
                row.map((point, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: 'lightgrey',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      border: '1px solid black'
                    }}
                    onClick={() => addPointToGrid(rowIndex, colIndex)}
                  >
                    {point ? (
                      <div onClick={() => handlePointClick(point)}>
                        {point.image ? (
                          <img src={point.image} alt="Point" style={{ width: '100%', height: '100%' }} />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
            <div>
              <h3>Available Points</h3>
              <ul>
                {availablePoints.map(point => (
                  <li
                    key={point.id}
                    onClick={() => setSelectedPointForPlacement(point)}
                    style={{ cursor: 'pointer', margin: '5px', textAlign: 'center' }}
                  >
                    {point.image ? (
                      <img src={point.image} alt="Available Point" style={{ width: '50px', height: '50px' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', backgroundColor: 'grey' }} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueMap;
