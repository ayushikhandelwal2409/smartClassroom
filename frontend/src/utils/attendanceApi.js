/**
 * Attendance API Utility Functions
 * Handles all API calls related to attendance
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Get authentication token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get headers with authentication token
 */
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'x-auth-token': token || ''
  };
};

/**
 * Get headers for file uploads
 */
const getAuthHeadersFormData = () => {
  const token = getToken();
  return {
    'x-auth-token': token || ''
  };
};

/**
 * Fetch today's timetable classes for a teacher
 * @param {string} teacherId - Teacher ID
 * @returns {Promise<Array>} Array of class objects
 */
export const fetchTodayClasses = async (teacherId) => {
  try {
    const token = getToken();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Fetch teacher schedule
    const scheduleRes = await fetch(`${API_BASE_URL}/schedules/teacher/me`, {
      headers: { 'x-auth-token': token }
    });
    
    if (!scheduleRes.ok) {
      throw new Error('Failed to fetch teacher schedule');
    }
    
    const schedules = await scheduleRes.json();
    
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
    const response = await fetch(`${API_BASE_URL}/students/section/${sectionName}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    
    const data = await response.json();
    return data.students || [];
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
    const response = await fetch(
      `${API_BASE_URL}/attendance/student/${studentId}?subjectCode=${subjectCode}`,
      {
        headers: getAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch attendance');
    }
    
    const data = await response.json();
    
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
    const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...attendanceData,
        markedBy: 'manual'
      })
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to mark attendance');
    }
    
    return data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

/**
 * Mark attendance for multiple students
 * @param {Array} attendanceList - Array of attendance objects
 * @returns {Promise<Object>} Response from server
 */
export const markBulkAttendance = async (attendanceList) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/mark-bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ attendanceList })
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to mark attendance');
    }
    
    return data;
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    throw error;
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
    
    const response = await fetch(`${API_BASE_URL}/face/scan`, {
      method: 'POST',
      headers: getAuthHeadersFormData(),
      body: formData
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from face recognition:', text);
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Face recognition failed');
    }
    
    return data.results || [];
  } catch (error) {
    console.error('Error in face recognition scan:', error);
    throw error;
  }
};

/**
 * Confirm face recognition attendance
 * @param {Array} attendanceList - Array of attendance objects from face recognition
 * @returns {Promise<Object>} Response from server
 */
export const confirmFaceRecognitionAttendance = async (attendanceList) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/mark-bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        attendanceList: attendanceList.map(item => ({
          ...item,
          markedBy: 'face-recognition'
        }))
      })
    });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to confirm attendance');
    }
    
    return data;
  } catch (error) {
    console.error('Error confirming face recognition attendance:', error);
    throw error;
  }
};

/**
 * Get student attendance records
 * @param {string} studentId - Student ID
 * @returns {Promise<Array>} Array of attendance records
 */
export const getStudentAttendance = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/student/${studentId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch student attendance');
    }
    
    const data = await response.json();
    return data.attendance || [];
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
    const response = await fetch(
      `${API_BASE_URL}/attendance/report/monthly?studentId=${studentId}&month=${month}&year=${year}`,
      {
        headers: getAuthHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch monthly report');
    }
    
    return await response.json();
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
    const response = await fetch(
      `${API_BASE_URL}/attendance/check?section=${section}&subjectCode=${subjectCode}&date=${date}&period=${period}`,
      {
        headers: getAuthHeaders()
      }
    );
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.marked || false;
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


