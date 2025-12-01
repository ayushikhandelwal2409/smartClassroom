/**
 * AttendanceHistory Component
 * Displays detailed attendance history for a subject
 */

import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const AttendanceHistory = ({ 
  history = [], 
  subjectCode,
  onBack = null 
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No attendance records found</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 transition"
          >
            ← Back to Subjects
          </button>
        )}
      </div>
    );
  }

  // Sort by date (newest first)
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Attendance History</h3>
          <p className="text-sm text-gray-600 mt-1">{subjectCode}</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* History List */}
      <div className="space-y-3">
        {sortedHistory.map((record, index) => {
          const date = new Date(record.date);
          const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });

          return (
            <motion.div
              key={`${record.date}-${record.period}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center justify-between p-4 rounded-lg border-2 transition-all
                ${record.status === 'present'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
                }
                hover:shadow-md
              `}
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Status Icon */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${record.status === 'present'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-600'
                  }
                `}>
                  {record.status === 'present' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>

                {/* Date and Period Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-800">{formattedDate}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Period {record.period}</span>
                    </div>
                    {record.markedBy && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {record.markedBy === 'face-recognition' ? 'Face Recognition' : 'Manual'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`
                px-4 py-2 rounded-full font-semibold text-sm
                ${record.status === 'present'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                }
              `}>
                {record.status === 'present' ? 'Present' : 'Absent'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Total Records</p>
            <p className="text-lg font-bold text-gray-800">{history.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Present</p>
            <p className="text-lg font-bold text-green-600">
              {history.filter(r => r.status === 'present').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Absent</p>
            <p className="text-lg font-bold text-red-600">
              {history.filter(r => r.status === 'absent').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;


