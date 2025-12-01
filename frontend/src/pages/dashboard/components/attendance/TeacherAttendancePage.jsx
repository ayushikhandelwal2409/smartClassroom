/**
 * TeacherAttendancePage Component
 * Complete attendance management page for teachers
 * Features:
 * - Display today's classes as cards
 * - Highlight current active class
 * - Manual attendance marking
 * - Face recognition attendance
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, Users, Camera, Upload, Save, CheckCircle, XCircle, 
  ArrowLeft, AlertCircle, BookOpen 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ClassCard from './ClassCard';
import StudentList from './StudentList';
import AttendanceToggle from './AttendanceToggle';
import {
  fetchTodayClasses,
  fetchSectionStudents,
  getStudentSubjectAttendance,
  markBulkAttendance,
  scanFaceRecognition,
  confirmFaceRecognitionAttendance,
  checkAttendanceMarked
} from '../../../../utils/attendanceApi';

const TeacherAttendancePage = ({ user, teacherTimetable }) => {
  const [todayClasses, setTodayClasses] = useState([]);
  const [currentActiveClass, setCurrentActiveClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [attendancePercentages, setAttendancePercentages] = useState({});
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null); // 'manual' or 'face-recognition'
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [faceRecognitionResults, setFaceRecognitionResults] = useState([]);
  const [isMarked, setIsMarked] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Helper: Get current day name
  const getCurrentDay = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Helper: Parse time string and check if current time is within slot
  const parseTimeRange = (timeString) => {
    if (!timeString || !timeString.includes('-')) return null;
    const parts = timeString.split('-');
    if (parts.length !== 2) return null;
    
    const startStr = parts[0].trim();
    const endStr = parts[1].trim();
    
    const parseTime = (timeStr) => {
      const trimmed = timeStr.trim();
      const periodMatch = trimmed.match(/\s*(AM|PM)\s*/i);
      if (!periodMatch) return null;
      
      const period = periodMatch[1].toUpperCase();
      const timePart = trimmed.replace(/\s*(AM|PM)\s*/i, '').trim();
      const [hoursStr, minutesStr] = timePart.split(':');
      
      if (!hoursStr || !minutesStr) return null;
      
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      return hour24 * 60 + minutes;
    };

    try {
      const start = parseTime(startStr);
      const end = parseTime(endStr);
      if (start === null || end === null) return null;
      return { start, end };
    } catch (error) {
      return null;
    }
  };

  const isCurrentTimeInSlot = (timeString) => {
    const timeRange = parseTimeRange(timeString);
    if (!timeRange) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= timeRange.start && currentMinutes < timeRange.end;
  };

  // Fetch today's classes
  useEffect(() => {
    const loadTodayClasses = async () => {
      console.log('TeacherAttendancePage - Loading today\'s classes');
      console.log('teacherTimetable:', teacherTimetable);
      
      if (!teacherTimetable || teacherTimetable.length === 0) {
        console.log('No teacherTimetable data available');
        setTodayClasses([]);
        return;
      }

      const currentDay = getCurrentDay();
      console.log('Current day:', currentDay);
      console.log('Available days in timetable:', teacherTimetable.map(d => d.day));
      
      const daySchedule = teacherTimetable.find(d => d.day === currentDay);
      
      if (!daySchedule) {
        console.log(`No schedule found for ${currentDay}`);
        setTodayClasses([]);
        return;
      }

      console.log('Day schedule found:', daySchedule);
      console.log('Slots:', daySchedule.slots);

      const classes = [];
      let activeClass = null;

      (daySchedule.slots || []).forEach((slot, index) => {
        if (slot && slot.subjectCode && slot.subjectCode.trim() !== '') {
          const classInfo = {
            subjectCode: slot.subjectCode,
            section: slot.sectionName,
            timeSlot: slot.time,
            roomNumber: slot.roomNumber,
            period: index + 1,
            day: currentDay
          };

          if (isCurrentTimeInSlot(slot.time)) {
            activeClass = classInfo;
          }

          classes.push(classInfo);
        }
      });

      console.log('Found classes for today:', classes);
      setTodayClasses(classes);
      setCurrentActiveClass(activeClass);

      // Check if attendance is already marked for active class
      if (activeClass) {
        checkIfMarked(activeClass);
      }
    };

    loadTodayClasses();
  }, [teacherTimetable]);

  // Check if attendance is already marked
  const checkIfMarked = async (classInfo) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const marked = await checkAttendanceMarked(
        classInfo.section,
        classInfo.subjectCode,
        today,
        classInfo.period
      );
      setIsMarked(marked);
    } catch (error) {
      console.error('Error checking attendance:', error);
    }
  };

  // Handle class selection
  const handleClassClick = async (classInfo) => {
    setSelectedClass(classInfo);
    setMode(null);
    setUploadedPhoto(null);
    setFaceRecognitionResults([]);
    setAttendance({});
    setError(null);
    setSuccess(null);

    // Check if already marked
    await checkIfMarked(classInfo);

    // Fetch students
    setLoading(true);
    try {
      const sectionStudents = await fetchSectionStudents(classInfo.section);
      setStudents(sectionStudents);

      // Initialize attendance (default: present)
      const initialAttendance = {};
      sectionStudents.forEach(student => {
        initialAttendance[student.studentId] = 'present';
      });
      setAttendance(initialAttendance);

      // Fetch attendance percentages
      const percentages = {};
      for (const student of sectionStudents) {
        try {
          const attData = await getStudentSubjectAttendance(
            student.studentId,
            classInfo.subjectCode
          );
          percentages[student.studentId] = attData.percentage;
        } catch (err) {
          percentages[student.studentId] = 0;
        }
      }
      setAttendancePercentages(percentages);
    } catch (error) {
      setError('Failed to load students');
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual attendance toggle
  const handleToggleAttendance = (studentId) => {
    if (mode !== 'manual' || isMarked) return;

    setAttendance(prev => {
      const current = prev[studentId];
      if (current === 'present') {
        return { ...prev, [studentId]: 'absent' };
      } else if (current === 'absent') {
        return { ...prev, [studentId]: 'present' };
      } else {
        return { ...prev, [studentId]: 'present' };
      }
    });
  };

  // Handle photo upload for face recognition
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setUploadedPhoto(file);
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const results = await scanFaceRecognition(
        file,
        selectedClass.section,
        selectedClass.subjectCode,
        selectedClass.period
      );

      setFaceRecognitionResults(results);

      // Merge results with attendance state
      // First, set all students to 'absent' by default
      const mergedAttendance = {};
      students.forEach(student => {
        mergedAttendance[student.studentId] = 'absent';
      });
      
      // Then mark matched students as 'present'
      results.forEach(result => {
        mergedAttendance[result.studentId] = result.status || 'present';
      });
      
      setAttendance(mergedAttendance);
      
      // Show success message
      if (results.length > 0) {
        setSuccess(`${results.length} student(s) detected and marked as present. Click "Submit Attendance" to save.`);
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError('No students detected in the photo. Please try again with a clearer image.');
      }
    } catch (error) {
      setError(error.message || 'Face recognition failed');
      console.error('Face recognition error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit attendance
  const handleSubmitAttendance = async () => {
    if (!selectedClass || isMarked) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceList = students.map(student => ({
        studentId: student.studentId,
        studentName: student.Name,
        section: selectedClass.section,
        subjectCode: selectedClass.subjectCode,
        teacherId: user.teacherId,
        teacherName: user.Name,
        date: today,
        period: selectedClass.period,
        // If face recognition mode: matched = present, not matched = absent
        // If manual mode: use what user selected
        status: attendance[student.studentId] || (mode === 'face-recognition' ? 'absent' : 'present'),
        markedBy: mode === 'face-recognition' ? 'face-recognition' : mode
      }));

      await markBulkAttendance(attendanceList);
      
      setSuccess('Attendance marked successfully!');
      setIsMarked(true);
      setMode(null);
      setUploadedPhoto(null);
      setFaceRecognitionResults([]);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.message || 'Failed to mark attendance');
      console.error('Error submitting attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-600" />
          Attendance Management
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Select a class to mark attendance for today
        </p>
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Classes */}
      {!selectedClass && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Today's Classes
          </h3>
          {!teacherTimetable || teacherTimetable.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold mb-2">Loading timetable...</p>
              <p className="text-sm text-gray-500">Please wait while we fetch your schedule</p>
            </div>
          ) : todayClasses.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold mb-2">No classes scheduled for today</p>
              <p className="text-sm text-gray-500">
                Today is {getCurrentDay()}. Check your timetable for scheduled classes.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayClasses.map((classInfo, index) => (
                <ClassCard
                  key={`${classInfo.subjectCode}-${classInfo.section}-${index}`}
                  classInfo={classInfo}
                  isActive={currentActiveClass && 
                    currentActiveClass.subjectCode === classInfo.subjectCode &&
                    currentActiveClass.section === classInfo.section &&
                    currentActiveClass.period === classInfo.period
                  }
                  onClick={() => handleClassClick(classInfo)}
                  isMarked={false} // TODO: Check if marked
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student List and Attendance */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {selectedClass.subjectCode} - Section {selectedClass.section}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedClass.timeSlot} • Period {selectedClass.period}
                {selectedClass.roomNumber && ` • Room ${selectedClass.roomNumber}`}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedClass(null);
                setMode(null);
                setAttendance({});
                setError(null);
                setSuccess(null);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Classes</span>
            </button>
          </div>

          {/* Already Marked Notice */}
          {isMarked && (
            <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Attendance already marked for this period</span>
              </div>
            </div>
          )}

          {/* Mode Selection */}
          {!mode && !isMarked && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">Select Attendance Method</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('manual')}
                  className="p-6 border-2 border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <CheckCircle className="w-8 h-8 text-blue-600 mb-2" />
                  <h5 className="font-bold text-lg mb-2">Manual Attendance</h5>
                  <p className="text-sm text-gray-600">
                    Manually mark students as present or absent using checkboxes
                  </p>
                </button>
                <button
                  onClick={() => setMode('face-recognition')}
                  className="p-6 border-2 border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  <Camera className="w-8 h-8 text-green-600 mb-2" />
                  <h5 className="font-bold text-lg mb-2">Face Recognition</h5>
                  <p className="text-sm text-gray-600">
                    Upload a class photo to automatically mark attendance using AI
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Face Recognition Mode */}
          {mode === 'face-recognition' && !isMarked && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                <Upload className="w-5 h-5 mr-2" />
                {uploadedPhoto ? 'Change Photo' : 'Upload Class Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {uploadedPhoto && (
                <div className="mt-4">
                  <p className="text-sm text-green-600 mb-2">
                    ✓ Photo uploaded: {uploadedPhoto.name}
                  </p>
                  {faceRecognitionResults.length > 0 && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700 font-semibold mb-1">
                        ✓ {faceRecognitionResults.length} student(s) detected!
                      </p>
                      <p className="text-xs text-gray-600">
                        Detected students: {faceRecognitionResults.map(r => r.studentName).join(', ')}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        ⚠️ Click "Submit Attendance" button below to save the attendance.
                      </p>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setMode(null)}
                className="mt-4 text-sm text-gray-600 hover:text-gray-800"
              >
                ← Change method
              </button>
            </div>
          )}

          {/* Manual Mode Info */}
          {mode === 'manual' && !isMarked && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Click on student cards to toggle attendance. Default is "Present".
              </p>
              <button
                onClick={() => setMode(null)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Change method
              </button>
            </div>
          )}

          {/* Students List */}
          {loading && students.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading students...</p>
            </div>
          ) : (
            <>
              <StudentList
                students={students}
                attendance={attendance}
                attendancePercentages={attendancePercentages}
                onToggleAttendance={mode === 'manual' ? handleToggleAttendance : null}
                showCheckboxes={mode !== null}
                subjectCode={selectedClass.subjectCode}
              />

              {/* Submit Button */}
              {mode && !isMarked && (
                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Present: {Object.values(attendance).filter(a => a === 'present').length} / {students.length} | 
                    Absent: {Object.values(attendance).filter(a => a === 'absent').length} / {students.length}
                  </div>
                  <button
                    onClick={handleSubmitAttendance}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Submit Attendance</span>
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TeacherAttendancePage;

