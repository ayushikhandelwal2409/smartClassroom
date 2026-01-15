/**
 * Attendance API Utility Functions
 * Handles all API calls related to attendance
 */

import api from '../api/axios';

/**
 * Fetch today's timetable classes for a teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} Array of class objects
 */
export const fetchTodayClasses = async (teacherId) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Fetch teacher schedule
    const scheduleRes = await api.get('/schedules/teacher/me');
    const schedules = scheduleRes.data;
    
    // Filter today's classes
    const todayClasses = schedules.filter(schedule => {
      const scheduleDay = new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long' });
      return scheduleDay === currentDay;
    });
    
    return todayClasses;
  } catch (error) {
    console.error('Error fetching today classes:', error);
    throw error;
  }
};

/**
 * Fetch students for a specific section
 * @param {string} sectionName - Section name (e.g., 'A', 'B', 'C')
 * @returns {Promise<Array>} Array of student objects
 */
export const fetchSectionStudents = async (sectionName) => {
  try {
    const response = await api.get(`/students/section/${sectionName}`);
    return response.data.students || [];
  } catch (error) {
    console.error('Error fetching section students:', error);
    throw error;
  }
};

/**
 * Get attendance percentage for a student in a subject
 * @param {string} studentId - Student ID
 * @param {string} subjectCode - Subject code
 * @returns {Promise<Object>} { totalPresent, totalClasses, percentage }
 */
export const getStudentSubjectAttendance = async (studentId, subjectCode) => {
  try {
    const response = await api.get(
      `/attendance/student/${studentId}?subjectCode=${subjectCode}`
    );
    const data = response.data;
    
    // Calculate percentage
    const totalClasses = data.totalClasses || 0;
    const totalPresent = data.totalPresent || 0;
    const percentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;
    
    return {
      totalPresent,
      totalClasses,
      percentage
    };
  } catch (error) {
    console.error('Error fetching student subject attendance:', error);
    return { totalPresent: 0, totalClasses: 0, percentage: 0 };
  }
};

/**
 * Mark attendance manually
 * @param {Object} attendanceData - { studentId, section, date, period, status, subjectCode, teacherId, teacherName }
 * @returns {Promise<Object>} Response from server
 */
export const markAttendance = async (attendanceData) => {
  try {
    const response = await api.post('/attendance/mark', {
      ...attendanceData,
      markedBy: 'manual'
    });
    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw new Error(error.response?.data?.msg || 'Failed to mark attendance');
  }
};

/**
 * Mark attendance for multiple students
 * @param {Array} attendanceList - Array of attendance objects
 * @returns {Promise<Object>} Response from server
 */
export const markBulkAttendance = async (attendanceList) => {
  try {
    const response = await api.post('/attendance/mark-bulk', { attendanceList });
    return response.data;
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    throw new Error(error.response?.data?.msg || 'Failed to mark attendance');
  }
};

/**
 * Face recognition attendance scan
 * @param {File} imageFile - Image file to scan
 * @param {string} section - Section name
 * @param {string} subjectCode - Subject code
 * @param {number} period - Period number
 * @returns {Promise<Array>} Array of { studentId, status }
 */
export const scanFaceRecognition = async (imageFile, section, subjectCode, period) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('section', section);
    formData.append('subjectCode', subjectCode);
    formData.append('period', period.toString());
    
    const response = await api.post('/face/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error in face recognition scan:', error);
    throw new Error(error.response?.data?.msg || 'Face recognition failed');
  }
};

/**
 * Confirm face recognition attendance
 * @param {Array} attendanceList - Array of attendance objects from face recognition
 * @returns {Promise<Object>} Response from server
 */
export const confirmFaceRecognitionAttendance = async (attendanceList) => {
  try {
    const response = await api.post('/attendance/mark-bulk', {
      attendanceList: attendanceList.map(item => ({
        ...item,
        markedBy: 'face-recognition'
      }))
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming face recognition attendance:', error);
    throw new Error(error.response?.data?.msg || 'Failed to confirm attendance');
  }
};

/**
 * Get student attendance records
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} Array of attendance records
 */
export const getStudentAttendance = async (studentId) => {
  try {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data.attendance || [];
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return [];
  }
};

/**
 * Get monthly attendance report
 * @param {string} studentId - Student ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Promise<Object>} Monthly report data
 */
export const getMonthlyAttendanceReport = async (studentId, month, year) => {
  try {
    const response = await api.get(
      `/attendance/report/monthly?studentId=${studentId}&month=${month}&year=${year}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    return { attendance: [], summary: {} };
  }
};

/**
 * Check if attendance is already marked for a period
 * @param {string} section - Section name
 * @param {string} subjectCode - Subject code
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} period - Period number
 * @returns {Promise<boolean>} True if already marked
 */
export const checkAttendanceMarked = async (section, subjectCode, date, period) => {
  try {
    const response = await api.get(
      `/attendance/check?section=${section}&subjectCode=${subjectCode}&date=${date}&period=${period}`
    );
    return response.data.marked || false;
  } catch (error) {
    console.error('Error checking attendance:', error);
    return false;
  }
};

/**
 * Get subject-wise attendance summary for a student
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} Array of { subjectCode, totalPresent, totalClasses, percentage }
 */
export const getSubjectWiseAttendance = async (studentId) => {
  try {
    const attendance = await getStudentAttendance(studentId);
    
    // Group by subject
    const subjectMap = {};
    attendance.forEach(record => {
      const { subjectCode, status } = record;
      if (!subjectMap[subjectCode]) {
        subjectMap[subjectCode] = {
          subjectCode,
          totalPresent: 0,
          totalClasses: 0
        };
      }
      subjectMap[subjectCode].totalClasses++;
      if (status === 'present') {
        subjectMap[subjectCode].totalPresent++;
      }
    });
    
    // Calculate percentages
    return Object.values(subjectMap).map(subject => ({
      ...subject,
      percentage: subject.totalClasses > 0 
        ? Math.round((subject.totalPresent / subject.totalClasses) * 100) 
        : 0
    }));
  } catch (error) {
    console.error('Error getting subject-wise attendance:', error);
    return [];
  }
};


