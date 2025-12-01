/**
 * ClassCard Component
 * Displays a timetable class as a clickable card
 * Highlights the current active class based on system time
 */

import React from 'react';
import { Clock, Users, MapPin, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const ClassCard = ({ 
  classInfo, 
  isActive = false, 
  onClick,
  isMarked = false 
}) => {
  const { subjectCode, section, timeSlot, roomNumber, period } = classInfo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-5 rounded-xl shadow-md cursor-pointer transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-blue-400 shadow-lg ring-4 ring-blue-200' 
          : 'bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300'
        }
        ${isMarked ? 'opacity-75' : ''}
      `}
    >
      {/* Active Badge */}
      {isActive && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
          LIVE
        </div>
      )}

      {/* Marked Badge */}
      {isMarked && (
        <div className={`absolute top-2 ${isActive ? 'right-16' : 'right-2'} ${isActive ? 'bg-green-300 text-green-900' : 'bg-green-100 text-green-800'} text-xs font-bold px-2 py-1 rounded-full`}>
          ✓ Marked
        </div>
      )}

      <div className="space-y-3">
        {/* Subject Code */}
        <div className="flex items-center space-x-2">
          <BookOpen className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-600'}`} />
          <h3 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>
            {subjectCode}
          </h3>
        </div>

        {/* Time Slot */}
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${isActive ? 'text-blue-100' : 'text-gray-600'}`} />
          <span className={`text-sm font-medium ${isActive ? 'text-blue-100' : 'text-gray-700'}`}>
            {timeSlot}
          </span>
        </div>

        {/* Section */}
        <div className="flex items-center space-x-2">
          <Users className={`w-4 h-4 ${isActive ? 'text-blue-100' : 'text-gray-600'}`} />
          <span className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-700'}`}>
            Section {section}
          </span>
        </div>

        {/* Room Number */}
        {roomNumber && (
          <div className="flex items-center space-x-2">
            <MapPin className={`w-4 h-4 ${isActive ? 'text-blue-100' : 'text-gray-600'}`} />
            <span className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-700'}`}>
              Room {roomNumber}
            </span>
          </div>
        )}

        {/* Period */}
        {period && (
          <div className={`text-xs ${isActive ? 'text-blue-200' : 'text-gray-500'}`}>
            Period {period}
          </div>
        )}
      </div>

      {/* Click Indicator */}
      <div className={`mt-4 text-xs font-medium ${isActive ? 'text-blue-200' : 'text-blue-600'}`}>
        Click to view students →
      </div>
    </motion.div>
  );
};

export default ClassCard;


