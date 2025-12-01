# Attendance Module - Frontend Implementation

## Overview
Complete frontend implementation for the attendance module with both Teacher and Student dashboards.

## 📁 Folder Structure

```
frontend/src/
├── utils/
│   └── attendanceApi.js                    # API utility functions
└── pages/dashboard/components/attendance/
    ├── ClassCard.jsx                       # Class card component
    ├── StudentList.jsx                    # Student list component
    ├── AttendanceToggle.jsx               # Attendance toggle component
    ├── SubjectAttendanceCard.jsx          # Subject attendance card
    ├── AttendanceHistory.jsx             # Attendance history component
    ├── TeacherAttendancePage.jsx          # Teacher attendance page
    └── StudentAttendancePage.jsx         # Student attendance page
```

## 🎯 Features Implemented

### Teacher Dashboard - Attendance Module

1. **Today's Classes Display**
   - Fetches all timetable classes for the current date
   - Displays classes as clickable cards
   - Highlights the current active class (based on system time)
   - Shows subject code, section, time slot, room number, and period

2. **Manual Attendance Mode**
   - Display all students in the selected section
   - Show student attendance percentage for the subject
   - Toggle attendance status (present/absent) with checkboxes
   - Default status is "present"
   - Submit attendance button
   - Prevents duplicate marking

3. **Face Recognition Mode**
   - Upload class photo button
   - Calls backend API: `POST /api/face/scan`
   - Displays detected students with their status
   - Confirm attendance button to finalize
   - Marked as 'face-recognition' in database

4. **Student Information Display**
   - Student roll number (studentId)
   - Student name
   - Student image (with fallback)
   - Subject attendance percentage
   - Visual progress bars

### Student Dashboard - Attendance Module

1. **Subject-wise Attendance Overview**
   - Overall statistics card (average attendance, total subjects, etc.)
   - Subject cards showing:
     - Subject name (subjectCode)
     - Total presents
     - Total classes held
     - Attendance percentage
     - Color-coded (green ≥75%, yellow 50-74%, red <50%)

2. **Detailed Attendance History**
   - Click on any subject to view detailed history
   - Shows:
     - Date
     - Period
     - Status (present/absent)
     - Marked by (manual/face-recognition)
   - Summary statistics

## 🔌 API Integration

All API calls are centralized in `utils/attendanceApi.js`:

### Teacher APIs
- `fetchTodayClasses(teacherId)` - Get today's classes
- `fetchSectionStudents(sectionName)` - Get students in a section
- `getStudentSubjectAttendance(studentId, subjectCode)` - Get attendance percentage
- `markBulkAttendance(attendanceList)` - Mark attendance for multiple students
- `scanFaceRecognition(imageFile, section, subjectCode, period)` - Face recognition scan
- `confirmFaceRecognitionAttendance(attendanceList)` - Confirm face recognition results
- `checkAttendanceMarked(section, subjectCode, date, period)` - Check if already marked

### Student APIs
- `getStudentAttendance(studentId)` - Get all attendance records
- `getSubjectWiseAttendance(studentId)` - Get subject-wise summary
- `getMonthlyAttendanceReport(studentId, month, year)` - Get monthly report

## 🎨 UI Components

### Reusable Components

1. **ClassCard** - Displays a timetable class as a card
2. **StudentList** - Lists students with attendance info
3. **AttendanceToggle** - Toggle button for marking attendance
4. **SubjectAttendanceCard** - Card showing subject attendance summary
5. **AttendanceHistory** - Detailed history view

## 📝 Usage

### Teacher Dashboard
1. Navigate to "Attendance" section
2. View today's classes as cards
3. Click on a class card
4. Select attendance method (Manual or Face Recognition)
5. Mark attendance
6. Submit

### Student Dashboard
1. Navigate to "Attendance" section
2. View subject-wise attendance cards
3. Click on any subject to see detailed history

## 🔧 Dependencies

- `react` - React framework
- `framer-motion` - Animations (optional, can be removed if not available)
- `lucide-react` - Icons
- `tailwindcss` - Styling

## 🚀 Integration

The attendance pages are already integrated into:
- `TeacherDashboard.jsx` - Uses `TeacherAttendancePage`
- `StudentDashboard.jsx` - Uses `StudentAttendancePage`

## 📋 API Endpoints Expected

The frontend expects these backend endpoints:

```
POST /api/attendance/mark              # Mark single attendance
POST /api/attendance/mark-bulk         # Mark bulk attendance
POST /api/face/scan                    # Face recognition scan
GET  /api/attendance/student/:id       # Get student attendance
GET  /api/attendance/report/monthly    # Monthly report
GET  /api/attendance/check             # Check if marked
GET  /api/students/section/:section     # Get section students
GET  /api/schedules/teacher/me         # Get teacher schedule
```

## 🎯 Features

✅ Clean, modern, responsive UI
✅ Loading states and skeletons
✅ Error handling and toast notifications
✅ Visual feedback for active classes
✅ Color-coded attendance percentages
✅ Prevents duplicate marking
✅ Face recognition integration ready
✅ Manual attendance with toggles
✅ Detailed attendance history
✅ Subject-wise statistics

## 📝 Notes

- All components use Tailwind CSS for styling
- API calls include proper error handling
- Loading states are implemented throughout
- Responsive design for mobile and desktop
- Accessible UI with proper ARIA labels (can be enhanced)


