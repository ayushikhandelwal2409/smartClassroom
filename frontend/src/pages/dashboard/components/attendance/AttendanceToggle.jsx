/**
 * AttendanceToggle Component
 * Toggle button/checkbox for marking student attendance
 */

import React from 'react';
import { CheckCircle, XCircle, Circle } from 'lucide-react';

const AttendanceToggle = ({ 
  status, 
  onChange, 
  studentName,
  disabled = false 
}) => {
  const handleClick = () => {
    if (disabled) return;
    
    // Cycle through: null -> present -> absent -> null
    if (status === null || status === undefined) {
      onChange('present');
    } else if (status === 'present') {
      onChange('absent');
    } else {
      onChange(null);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        flex items-center justify-center w-10 h-10 rounded-full transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
        ${status === 'present' 
          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
          : status === 'absent'
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }
      `}
      title={disabled ? 'Attendance already marked' : `Click to mark ${studentName}`}
    >
      {status === 'present' && <CheckCircle className="w-6 h-6" />}
      {status === 'absent' && <XCircle className="w-6 h-6" />}
      {(status === null || status === undefined) && <Circle className="w-6 h-6" />}
    </button>
  );
};

export default AttendanceToggle;


