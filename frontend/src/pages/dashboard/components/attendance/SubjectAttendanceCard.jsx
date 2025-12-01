/**
 * SubjectAttendanceCard Component
 * Displays subject-wise attendance summary for students
 */

import React from 'react';
import { BookOpen, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SubjectAttendanceCard = ({ 
  subjectCode, 
  totalPresent, 
  totalClasses, 
  percentage,
  onClick = null 
}) => {
  const getColorClass = (percent) => {
    if (percent >= 75) return 'green';
    if (percent >= 50) return 'yellow';
    return 'red';
  };

  const color = getColorClass(percentage);
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-700',
      progress: 'bg-green-500',
      icon: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-700',
      progress: 'bg-yellow-500',
      icon: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-700',
      progress: 'bg-red-500',
      icon: 'text-red-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={onClick ? { scale: 1.02 } : {}}
      onClick={onClick}
      className={`
        p-6 rounded-xl border-2 transition-all
        ${classes.bg} ${classes.border}
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <BookOpen className={`w-6 h-6 ${classes.icon}`} />
          <h3 className={`text-xl font-bold ${classes.text}`}>
            {subjectCode}
          </h3>
        </div>
        <div className={`text-3xl font-bold ${classes.text}`}>
          {percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-3 rounded-full ${classes.progress}`}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className={`w-4 h-4 ${classes.icon}`} />
          <div>
            <p className={`text-xs ${classes.text} opacity-70`}>Present</p>
            <p className={`text-lg font-bold ${classes.text}`}>{totalPresent}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className={`w-4 h-4 ${classes.icon}`} />
          <div>
            <p className={`text-xs ${classes.text} opacity-70`}>Total Classes</p>
            <p className={`text-lg font-bold ${classes.text}`}>{totalClasses}</p>
          </div>
        </div>
      </div>

      {onClick && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className={`text-sm text-center ${classes.text} opacity-70`}>
            Click to view detailed history →
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default SubjectAttendanceCard;

