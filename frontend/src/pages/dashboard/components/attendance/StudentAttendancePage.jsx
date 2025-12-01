/**
 * StudentAttendancePage Component
 * Complete attendance view page for students
 * Features:
 * - Subject-wise attendance percentage
 * - Detailed attendance history per subject
 * - Monthly attendance reports
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, TrendingUp, ArrowLeft, 
  CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SubjectAttendanceCard from './SubjectAttendanceCard';
import AttendanceHistory from './AttendanceHistory';
import {
  getSubjectWiseAttendance,
  getStudentAttendance,
  getMonthlyAttendanceReport
} from '../../../../utils/attendanceApi';

const StudentAttendancePage = ({ user }) => {
  const [subjectAttendance, setSubjectAttendance] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'history'

  // Fetch subject-wise attendance on mount
  useEffect(() => {
    if (user?.studentId) {
      loadSubjectAttendance();
    }
  }, [user]);

  // Load subject-wise attendance
  const loadSubjectAttendance = async () => {
    if (!user?.studentId) return;

    setLoading(true);
    setError(null);

    try {
      const attendance = await getSubjectWiseAttendance(user.studentId);
      setSubjectAttendance(attendance);
    } catch (error) {
      setError('Failed to load attendance data');
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle subject click - show detailed history
  const handleSubjectClick = async (subjectCode) => {
    setSelectedSubject(subjectCode);
    setViewMode('history');
    setLoading(true);
    setError(null);

    try {
      const allAttendance = await getStudentAttendance(user.studentId);
      // Filter by subject
      const subjectHistory = allAttendance.filter(
        record => record.subjectCode === subjectCode
      );
      setAttendanceHistory(subjectHistory);
    } catch (error) {
      setError('Failed to load attendance history');
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Go back to overview
  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedSubject(null);
    setAttendanceHistory([]);
  };

  // Calculate overall statistics
  const getOverallStats = () => {
    if (subjectAttendance.length === 0) {
      return { average: 0, totalSubjects: 0, totalPresent: 0, totalClasses: 0 };
    }

    let totalPresent = 0;
    let totalClasses = 0;
    let totalPercentage = 0;

    subjectAttendance.forEach(subject => {
      totalPresent += subject.totalPresent;
      totalClasses += subject.totalClasses;
      totalPercentage += subject.percentage;
    });

    const average = Math.round(totalPercentage / subjectAttendance.length);

    return {
      average,
      totalSubjects: subjectAttendance.length,
      totalPresent,
      totalClasses
    };
  };

  const overallStats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-blue-600" />
          My Attendance
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          View your attendance records and statistics
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Overview Mode - Subject Cards */}
      {viewMode === 'overview' && (
        <>
          {/* Overall Statistics */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm opacity-90">Overall Attendance</p>
                <p className="text-3xl font-bold mt-1">{overallStats.average}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90">Total Subjects</p>
                <p className="text-3xl font-bold mt-1">{overallStats.totalSubjects}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90">Total Present</p>
                <p className="text-3xl font-bold mt-1">{overallStats.totalPresent}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90">Total Classes</p>
                <p className="text-3xl font-bold mt-1">{overallStats.totalClasses}</p>
              </div>
            </div>
          </div>

          {/* Subject Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading attendance data...</p>
            </div>
          ) : subjectAttendance.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No attendance records found</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                Subject-wise Attendance
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectAttendance.map((subject, index) => (
                  <motion.div
                    key={subject.subjectCode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SubjectAttendanceCard
                      subjectCode={subject.subjectCode}
                      totalPresent={subject.totalPresent}
                      totalClasses={subject.totalClasses}
                      percentage={subject.percentage}
                      onClick={() => handleSubjectClick(subject.subjectCode)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* History Mode - Detailed History */}
      {viewMode === 'history' && selectedSubject && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-xl shadow"
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading attendance history...</p>
            </div>
          ) : (
            <AttendanceHistory
              history={attendanceHistory}
              subjectCode={selectedSubject}
              onBack={handleBackToOverview}
            />
          )}
        </motion.div>
      )}

      {/* Attendance Legend */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h4 className="text-sm font-semibold mb-3">Attendance Status</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>≥ 75% (Good)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>50-74% (Warning)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>&lt; 50% (Critical)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendancePage;

