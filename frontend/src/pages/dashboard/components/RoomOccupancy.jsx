import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Building2 } from 'lucide-react';

const RoomOccupancy = () => {
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchOccupancy = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blocks/occupancy');
      if (!response.ok) {
        throw new Error('Failed to fetch occupancy data');
      }
      const data = await response.json();
      setOccupancyData(data.occupancy || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching occupancy:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancy();
    
    // Auto-refresh every 1 hour (3600000 milliseconds)
    const interval = setInterval(() => {
      fetchOccupancy();
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  // Group occupancy data by block
  const groupedByBlock = occupancyData.reduce((acc, room) => {
    const blockKey = room.blockName;
    if (!acc[blockKey]) {
      acc[blockKey] = [];
    }
    acc[blockKey].push(room);
    return acc;
  }, {});

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchOccupancy}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Compact */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h3 className="text-lg sm:text-xl font-bold flex items-center">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
            Room Occupancy
          </h3>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs sm:text-sm border-t pt-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500 border border-green-600"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500 border border-gray-600"></div>
            <span className="text-gray-600">Occupied</span>
          </div>
        </div>
      </div>

      {/* Occupancy Cards - Compact Grid */}
      {Object.keys(groupedByBlock).length === 0 ? (
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-sm text-gray-600">No room occupancy data available</p>
        </div>
      ) : (
        Object.entries(groupedByBlock).map(([blockName, rooms], blockIndex) => (
          <div key={blockName} className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <h4 className="text-base sm:text-lg font-bold mb-3 text-blue-600">
              {blockName}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {rooms.map((room, index) => (
                <motion.div
                  key={`${room.blockName}-${room.roomName}`}
                  custom={blockIndex * 10 + index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className={`p-2 sm:p-3 rounded-md border transition-all ${
                    room.status === 'Occupied'
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-green-300 bg-green-50'
                  }`}
                >
                  {/* Room Header - Compact */}
                  <div className="mb-2">
                    <span className="font-semibold text-sm sm:text-base">Room {room.roomName}</span>
                  </div>

                  {/* Section and Class Info - Only for Occupied */}
                  {room.status === 'Occupied' && room.sectionName !== '—' && (
                    <div className="mb-2 space-y-0.5">
                      <div className="text-xs">
                        <span className="font-medium">Sec:</span>{' '}
                        <span className="text-gray-700">{room.sectionName}</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Class:</span>{' '}
                        <span className="text-gray-700 truncate block">{room.currentClass}</span>
                      </div>
                      {room.timeSlot && room.timeSlot !== '—' && (
                        <div className="text-xs text-gray-600 flex items-center">
                          <Clock className="w-2.5 h-2.5 mr-1" />
                          <span className="truncate">{room.timeSlot.split(' - ')[0]}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Occupancy Progress Bar - Only for Occupied */}
                  {room.status === 'Occupied' && (
                    <>
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            Occupancy
                          </span>
                          <span className="text-xs font-bold text-gray-700">
                            {room.occupancyPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-gray-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${room.occupancyPercentage}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Student Count - Compact */}
                      <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>
                          {room.studentCount}/{room.capacity}
                        </span>
                      </div>
                    </>
                  )}

                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Refresh Button - Compact */}
      <div className="flex justify-center pt-2">
        <button
          onClick={fetchOccupancy}
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <Clock className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default RoomOccupancy;

