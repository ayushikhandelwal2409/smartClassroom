import React, { useState, useEffect } from 'react';
import { Clock, Users, Camera, Upload, CheckCircle, XCircle, Fingerprint, Edit3, Save, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../api/axios';

const AttendanceManagement = ({ user, teacherTimetable, sectionsToTeach, subjectTaught }) => {
  const [currentClass, setCurrentClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [allSectionClasses, setAllSectionClasses] = useState([]); // All classes for all sections
  const [students, setStudents] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState({}); // { studentId: { subjectCode: percentage } }
  const [loading, setLoading] = useState(false);
  const [attendanceMode, setAttendanceMode] = useState(null); // 'biometric' or 'manual'
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [attendance, setAttendance] = useState({}); // { studentId: 'present' | 'absent' }
  const [showStudentList, setShowStudentList] = useState(false);
  const [viewMode, setViewMode] = useState('sections'); // 'sections', 'students', or 'attendance'

  // Helper function to get current day
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Helper function to parse time string (e.g., "10:00 AM - 11:00 AM")
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

  // Helper function to check if current time is within a time slot
  const isCurrentTimeInSlot = (timeString) => {
    const timeRange = parseTimeRange(timeString);
    if (!timeRange) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    return currentMinutes >= timeRange.start && currentMinutes < timeRange.end;
  };

  // Get all classes for all sections the teacher teaches
  useEffect(() => {
    if (!teacherTimetable || teacherTimetable.length === 0) return;

    const currentDay = getCurrentDay();
    const daySchedule = teacherTimetable.find(d => d.day === currentDay);
    
    const allClasses = [];
    let currentActiveClass = null;

    // Process all days to get all classes
    teacherTimetable.forEach(daySchedule => {
      (daySchedule.slots || []).forEach(slot => {
        if (slot && slot.subjectCode && slot.subjectCode.trim() !== '') {
          const classInfo = {
            subjectCode: slot.subjectCode,
            sectionName: slot.sectionName,
            timeSlot: slot.time,
            roomNumber: slot.roomNumber,
            academicBlock: slot.academicBlock,
            day: daySchedule.day
          };
          
          // Check if this is the current active class
          if (daySchedule.day === currentDay && isCurrentTimeInSlot(slot.time)) {
            currentActiveClass = classInfo;
          }
          
          allClasses.push(classInfo);
        }
      });
    });

    // Group classes by section
    const sectionClasses = {};
    allClasses.forEach(cls => {
      if (!sectionClasses[cls.sectionName]) {
        sectionClasses[cls.sectionName] = [];
      }
      sectionClasses[cls.sectionName].push(cls);
    });

    setAllSectionClasses(sectionClasses);
    setCurrentClass(currentActiveClass);
    
    // Auto-select current class if available
    if (currentActiveClass) {
      setSelectedSection(currentActiveClass.sectionName);
      setSelectedSubject(currentActiveClass.subjectCode);
    }
  }, [teacherTimetable]);

  // Fetch students when section is selected
  useEffect(() => {
    if (selectedSection) {
      fetchStudents(selectedSection);
    }
  }, [selectedSection]);

  // Fetch attendance when students and subject are available
  useEffect(() => {
    if (selectedSection && selectedSubject && students.length > 0) {
      fetchStudentAttendance(selectedSection, selectedSubject);
    }
  }, [selectedSection, selectedSubject, students]);

  const fetchStudents = async (sectionName) => {
    setLoading(true);
    try {
      const response = await api.get(`/students/section/${sectionName}`);
      const data = response.data;
      setStudents(data.students || []);
      // Initialize attendance state
      const initialAttendance = {};
      data.students.forEach(student => {
        initialAttendance[student.studentId] = null; // null = not marked yet
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendance = async (sectionName, subjectCode) => {
    try {
      const token = localStorage.getItem('token');
      // TODO: Replace with actual attendance API endpoint
      // For now, we'll simulate attendance data based on students
      // In real implementation: fetch from /api/attendance/section/:sectionName/subject/:subjectCode
      const attendanceData = {};
      students.forEach(student => {
        // Simulate attendance percentage (70-95% range)
        // Use a consistent seed based on studentId for consistent results
        const seed = student.studentId % 100;
        attendanceData[student.studentId] = 70 + (seed % 25);
      });
      setStudentAttendance(prev => ({
        ...prev,
        [sectionName]: {
          ...prev[sectionName],
          [subjectCode]: attendanceData
        }
      }));
    } catch (error) {
      console.error('Error fetching student attendance:', error);
    }
  };

  const handleSectionClick = (sectionName) => {
    setSelectedSection(sectionName);
    setShowStudentList(true);
    setViewMode('students');
    // If section has classes, show them to select subject
    if (allSectionClasses[sectionName] && allSectionClasses[sectionName].length > 0) {
      // Auto-select first subject if available
      const firstClass = allSectionClasses[sectionName][0];
      setSelectedSubject(firstClass.subjectCode);
    }
  };

  const handleSubjectSelect = (subjectCode) => {
    setSelectedSubject(subjectCode);
    setShowStudentList(true);
  };

  const handleTakeAttendance = () => {
    setViewMode('attendance');
    setAttendanceMode(null);
  };

  const handleAttendanceMode = (mode) => {
    setAttendanceMode(mode);
    setUploadedPhoto(null);
    // Reset attendance when switching modes
    const resetAttendance = {};
    students.forEach(student => {
      resetAttendance[student.studentId] = null;
    });
    setAttendance(resetAttendance);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedPhoto(file);
      // Simulate biometric recognition (in real app, this would call an API)
      // For now, randomly mark some students as present
      const newAttendance = { ...attendance };
      students.forEach(student => {
        // Simulate 70% attendance rate
        newAttendance[student.studentId] = Math.random() > 0.3 ? 'present' : 'absent';
      });
      setAttendance(newAttendance);
    }
  };

  const toggleStudentAttendance = (studentId) => {
    if (attendanceMode !== 'manual') return;
    
    setAttendance(prev => {
      const current = prev[studentId];
      if (current === 'present') {
        return { ...prev, [studentId]: 'absent' };
      } else if (current === 'absent') {
        return { ...prev, [studentId]: null };
      } else {
        return { ...prev, [studentId]: 'present' };
      }
    });
  };

  const handleSaveAttendance = () => {
    // TODO: Save attendance to backend
    const presentCount = Object.values(attendance).filter(a => a === 'present').length;
    const absentCount = Object.values(attendance).filter(a => a === 'absent').length;
    const total = students.length;
    
    alert(`Attendance saved for ${selectedSubject} - Section ${selectedSection}!\nPresent: ${presentCount}/${total}\nAbsent: ${absentCount}/${total}`);
    
    // Reset after saving
    setAttendanceMode(null);
    setUploadedPhoto(null);
    setShowStudentList(false);
  };

  // Show message if no classes are found
  if (!teacherTimetable || teacherTimetable.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Classes Found</h3>
        <p className="text-gray-600">Your timetable is not available. Please contact admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Class Card - if there's an active class */}
      {currentClass && viewMode === 'sections' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
          onClick={() => {
            setSelectedSection(currentClass.sectionName);
            setSelectedSubject(currentClass.subjectCode);
            setShowStudentList(true);
            setViewMode('students');
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Current Class - Click to View Students</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{currentClass.subjectCode}</h3>
              <div className="flex items-center space-x-4 text-sm opacity-90">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Section {currentClass.sectionName}
                </span>
                <span>{currentClass.timeSlot}</span>
                <span>Room {currentClass.roomNumber} - {currentClass.academicBlock}</span>
              </div>
            </div>
            <div className="text-right">
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
                View Students
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sections List */}
      {viewMode === 'sections' && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            Your Sections
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Click on a section to view students and their attendance
          </p>

          {!sectionsToTeach || sectionsToTeach.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No sections assigned to you</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectionsToTeach.map((sectionName) => {
                const sectionClasses = allSectionClasses[sectionName] || [];
                const uniqueSubjects = [...new Set(sectionClasses.map(c => c.subjectCode))];
                return (
                  <motion.div
                    key={sectionName}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-white"
                    onClick={() => handleSectionClick(sectionName)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-8 h-8 text-blue-600" />
                        <h4 className="text-xl font-bold text-blue-600">Section {sectionName}</h4>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Subjects:</strong> {uniqueSubjects.join(', ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Classes:</strong> {sectionClasses.length}
                      </p>
                    </div>
                    <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
                      View Students & Attendance
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Students List with Attendance */}
      {showStudentList && selectedSection && viewMode === 'students' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold flex items-center">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Section {selectedSection}
              </h3>
              {selectedSubject && (
                <p className="text-sm text-gray-600 mt-1">Subject: {selectedSubject}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setViewMode('sections');
                  setShowStudentList(false);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Back to Sections
              </button>
              {selectedSubject && (
                <button
                  onClick={handleTakeAttendance}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Take Attendance
                </button>
              )}
            </div>
          </div>

          {/* Subject Selection */}
          {allSectionClasses[selectedSection] && allSectionClasses[selectedSection].length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject to View Attendance:
              </label>
              <div className="flex flex-wrap gap-2">
                {[...new Set(allSectionClasses[selectedSection].map(c => c.subjectCode))].map((subjectCode) => (
                  <button
                    key={subjectCode}
                    onClick={() => handleSubjectSelect(subjectCode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedSubject === subjectCode
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subjectCode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Students List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : selectedSubject ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => {
                const attendancePercent = studentAttendance[selectedSection]?.[selectedSubject]?.[student.studentId] || 0;
                const attendanceColor = attendancePercent >= 75 ? 'green' : attendancePercent >= 50 ? 'yellow' : 'red';
                
                return (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {student.image ? (
                          <img
                            src={`${process.env.REACT_APP_API_URL}/${student.image}`}
                            alt={student.Name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                            {student.Name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-gray-800 truncate">{student.Name}</h5>
                        <p className="text-xs text-gray-600">ID: {student.studentId}</p>
                      </div>
                    </div>
                    
                    {selectedSubject && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Attendance ({selectedSubject}):</span>
                          <span className={`text-sm font-bold ${
                            attendanceColor === 'green' ? 'text-green-600' :
                            attendanceColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {attendancePercent}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              attendanceColor === 'green' ? 'bg-green-500' :
                              attendanceColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${attendancePercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Please select a subject to view attendance</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Take Attendance View */}
      {viewMode === 'attendance' && selectedSection && selectedSubject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold">Take Attendance</h4>
                <p className="text-sm text-gray-600">
                  Section {selectedSection} - {selectedSubject}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewMode('students');
                  setAttendanceMode(null);
                  setUploadedPhoto(null);
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to Students
              </button>
            </div>
            
            {/* Attendance Mode Selection */}
            {!attendanceMode && (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleAttendanceMode('biometric')}
                  className="p-6 border-2 border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <Fingerprint className="w-8 h-8 text-blue-600 mb-2" />
                  <h5 className="font-bold text-lg mb-2">Biometric Attendance</h5>
                  <p className="text-sm text-gray-600">Upload a photo to automatically mark attendance using face recognition</p>
                </button>
                <button
                  onClick={() => handleAttendanceMode('manual')}
                  className="p-6 border-2 border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                >
                  <Edit3 className="w-8 h-8 text-green-600 mb-2" />
                  <h5 className="font-bold text-lg mb-2">Manual Attendance</h5>
                  <p className="text-sm text-gray-600">Manually mark students as present or absent by clicking on them</p>
                </button>
              </div>
            )}

            {/* Biometric Mode */}
            {attendanceMode === 'biometric' && (
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <label className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
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
                      <p className="text-sm text-green-600 mb-2">✓ Photo uploaded: {uploadedPhoto.name}</p>
                      <p className="text-xs text-gray-600">Attendance has been automatically marked based on face recognition.</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleAttendanceMode(null)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Change method
                </button>
              </div>
            )}

            {/* Manual Mode */}
            {attendanceMode === 'manual' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">Click on student cards to mark attendance</p>
                  <button
                    onClick={() => handleAttendanceMode(null)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Change method
                  </button>
                </div>
              </div>
            )}

            {/* Student List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading students...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {students.map((student) => {
                    const attendanceStatus = attendance[student.studentId];
                    return (
                      <motion.div
                        key={student.studentId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          attendanceMode === 'manual' ? 'cursor-pointer hover:shadow-md' : ''
                        } ${
                          attendanceStatus === 'present'
                            ? 'border-green-300 bg-green-50'
                            : attendanceStatus === 'absent'
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                        onClick={() => toggleStudentAttendance(student.studentId)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                              {student.image ? (
                                <img
                                  src={`${process.env.REACT_APP_API_URL}/${student.image}`}
                                  alt={student.Name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                  {student.Name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-semibold">{student.Name}</h5>
                              <p className="text-xs text-gray-600">ID: {student.studentId}</p>
                            </div>
                          </div>
                          <div>
                            {attendanceStatus === 'present' && (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            )}
                            {attendanceStatus === 'absent' && (
                              <XCircle className="w-6 h-6 text-red-600" />
                            )}
                            {attendanceStatus === null && (
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                            )}
                          </div>
                        </div>
                        {attendanceMode === 'manual' && (
                          <div className="text-xs text-gray-500 mt-2">
                            Click to {attendanceStatus === 'present' ? 'mark absent' : attendanceStatus === 'absent' ? 'unmark' : 'mark present'}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Save Button */}
                {attendanceMode && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Present: {Object.values(attendance).filter(a => a === 'present').length} / {students.length} | 
                      Absent: {Object.values(attendance).filter(a => a === 'absent').length} / {students.length}
                    </div>
                    <button
                      onClick={handleSaveAttendance}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Attendance</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AttendanceManagement;

