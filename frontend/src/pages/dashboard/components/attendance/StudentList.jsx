/**
 * StudentList Component
 * Displays a list of students with their attendance information
 */

import React from 'react';
import { User, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentList = ({ 
  students, 
  attendance = {}, 
  attendancePercentages = {},
  onToggleAttendance = null,
  showCheckboxes = false,
  subjectCode = null 
}) => {
  if (!students || students.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No students found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student, index) => {
        const attendanceStatus = attendance[student.studentId];
        const attendancePercent = attendancePercentages[student.studentId] || 0;
        const attendanceColor = 
          attendancePercent >= 75 ? 'green' : 
          attendancePercent >= 50 ? 'yellow' : 'red';

        return (
          <motion.div
            key={student.studentId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex items-center justify-between p-4 rounded-lg border-2 transition-all
              ${attendanceStatus === 'present' 
                ? 'border-green-300 bg-green-50' 
                : attendanceStatus === 'absent'
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
              ${onToggleAttendance ? 'cursor-pointer hover:shadow-md' : ''}
            `}
            onClick={() => onToggleAttendance && onToggleAttendance(student.studentId)}
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Student Image/Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {student.image ? (
                  <img
                    src={`http://localhost:5000/${student.image}`}
                    alt={student.Name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg"
                  style={{ display: student.image ? 'none' : 'flex' }}
                >
                  {student.Name?.charAt(0) || <User className="w-6 h-6" />}
                </div>
              </div>

              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-gray-800 truncate">{student.Name}</h5>
                <p className="text-xs text-gray-600">ID: {student.studentId}</p>
                
                {/* Attendance Percentage (if subjectCode provided) */}
                {subjectCode && attendancePercent !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Attendance ({subjectCode}):</span>
                      <span className={`text-xs font-bold ${
                        attendanceColor === 'green' ? 'text-green-600' :
                        attendanceColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {attendancePercent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          attendanceColor === 'green' ? 'bg-green-500' :
                          attendanceColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${attendancePercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Status Indicator */}
            {showCheckboxes && (
              <div className="ml-4 flex-shrink-0">
                {attendanceStatus === 'present' && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                {attendanceStatus === 'absent' && (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                {!attendanceStatus && (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default StudentList;


