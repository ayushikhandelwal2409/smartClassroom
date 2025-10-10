import React, { useState, useEffect } from "react";
import { CalendarDays, LogOut, User, ChevronLeft, ChevronRight, Camera, Upload, Clock, MapPin, Users, BookOpen, AlertTriangle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  // user
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Main content state
  const [activeSection, setActiveSection] = useState('home');

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Attendance states
  const [selectedClass, setSelectedClass] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [students, setStudents] = useState([]);

  // Timetable state
  const [timeSlots, setTimeSlots] = useState([]); // from building blocks (6 per day)
  const [teacherSchedule, setTeacherSchedule] = useState([]); // entries from /api/schedules/teacher/me
  const [sections, setSections] = useState([]); // from /api/sections
  const [todaySubjects, setTodaySubjects] = useState([]); // entries for today mapped to timeSlots

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const fullDayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' };

  // helper: render timeslot label
  const to12h = (hhmm) => {
    if (!hhmm) return '';
    const [hStr, m] = hhmm.split(':');
    const h = parseInt(hStr, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    return `${h12.toString().padStart(2,'0')}:${m} ${suffix}`;
  };
  const formatSlot = (slot) => slot ? `${to12h(slot.start)} - ${to12h(slot.end)}` : '';
  const getSubjectFor = (fullDay, slotIndex) => {
    if (!sections || sections.length === 0) return '—';
    const reference = sections[0];
    const dayEntry = reference?.timetable?.find(d => d.day === fullDay);
    const subj = dayEntry?.slots?.[slotIndex];
    return subj || '—';
  };

  // Sample data for classes and students
  const classes = ['3A', '3B', '4A', '4B', '5A'];
  const sampleStudents = {
    '3A': [
      { id: 'S001', name: 'John Doe', attendance: 85 },
      { id: 'S002', name: 'Jane Smith', attendance: 92 },
      { id: 'S003', name: 'Mike Johnson', attendance: 65 },
      { id: 'S004', name: 'Sarah Wilson', attendance: 78 },
    ],
    '3B': [
      { id: 'S005', name: 'Alex Brown', attendance: 88 },
      { id: 'S006', name: 'Emma Davis', attendance: 95 },
      { id: 'S007', name: 'Chris Lee', attendance: 72 },
      { id: 'S008', name: 'Lisa Garcia', attendance: 81 },
    ]
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for ( let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    if (day) {
      const newDate = new Date(currentDate);
      newDate.setDate(day);
      setSelectedDate(newDate);
    }
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!day) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Handle photo upload
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedPhoto(file);
      // Simulate attendance marking after photo upload
      const currentStudents = sampleStudents[selectedClass] || [];
      const markedStudents = currentStudents.map(student => ({
        ...student,
        marked: Math.random() > 0.3 // Randomly mark 70% as present
      }));
      setStudents(markedStudents);
    } else {
      alert('Please upload a valid image file');
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    // This would integrate with camera API in a real implementation
    alert('Camera feature would be implemented here');
  };

  // Render main content based on active section
  const renderMainContent = () => {
    switch (activeSection) {
      case 'attendance':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-bold mb-4">Attendance Management</h3>
              
              {/* Show Attendance */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Show Attendance
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  {classes.map((className) => (
                    <button
                      key={className}
                      onClick={() => setSelectedClass(className)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedClass === className
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {className}
                    </button>
                  ))}
                </div>
                
                {selectedClass && sampleStudents[selectedClass] && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sampleStudents[selectedClass].map((student) => (
                      <div
                        key={student.id}
                        className={`p-4 rounded-lg border-2 ${
                          student.attendance >= 70
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold">{student.name}</h5>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            student.attendance >= 70
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}>
                            {student.attendance}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">ID: {student.id}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Take Attendance */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Take Attendance
                </h4>
                
                {/* Photo Upload Section */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <button
                      onClick={handleCameraCapture}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo
                    </button>
                    <div className="flex-1">
                      <label className="flex items-center justify-center w-full h-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload from Gallery
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  {uploadedPhoto && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Photo uploaded: {uploadedPhoto.name}
                    </p>
                  )}
                </div>

                {/* Class Selection for Taking Attendance */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Select Class:</label>
                  <select
                    value={selectedClass || ''}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full md:w-48 p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Choose a class</option>
                    {classes.map((className) => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>

                {/* Student List */}
                {selectedClass && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(students.length > 0 ? students : sampleStudents[selectedClass] || []).map((student) => (
                      <div
                        key={student.id}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          uploadedPhoto
                            ? student.marked
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <h5 className="font-semibold">{student.name}</h5>
                        <p className="text-sm text-gray-600">ID: {student.id}</p>
                        {uploadedPhoto && (
                          <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                            student.marked
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}>
                            {student.marked ? 'Present' : 'Absent'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual Attendance */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Manual Attendance
                </h4>
                <div className="bg-gray-100 p-8 rounded-lg text-center">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Manual attendance feature will be implemented later.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'timetable':
        return (
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              Timetable
            </h3>
            {/* Today's Classes summary */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Today's Classes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {timeSlots.map((slot, idx) => (
                  <div key={idx} className={`p-3 rounded border ${slot.isLunch ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-sm font-medium mb-1">{formatSlot(slot)}</div>
                    {slot.isLunch ? (
                      <div className="text-yellow-700 text-sm font-semibold">Lunch</div>
                    ) : (
                      <div className="text-sm text-gray-700">{todaySubjects[idx] || '—'}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Time</th>
                    {workingDays.map((day) => (
                      <th key={day} className="border border-gray-300 p-3 text-center font-semibold">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-3 font-medium bg-gray-50">
                        {formatSlot(slot)}
                      </td>
                      {workingDays.map((day) => {
                        const fullDay = fullDayMap[day];
                        const entry = teacherSchedule.find(e => e.dayOfWeek === fullDay && e.startTime === slot.start && e.endTime === slot.end);
                        return (
                          <td key={day} className={`border border-gray-300 p-3 text-center ${slot.isLunch ? 'bg-yellow-50' : ''}`}>
                            <div className="min-h-[60px] flex items-center justify-center">
                              {slot.isLunch || todaySubjects[index] === 'Lunch' ? (
                                <span className="text-sm font-semibold text-yellow-700">Lunch</span>
                              ) : (
                                <div className="text-sm">
                                  {entry ? (
                                    <>
                                      <div className="font-semibold">
                                        {(entry.course?.name || 'Class')}
                                        {entry.course?.code ? ` (${entry.course.code})` : ''}
                                      </div>
                                      <div className="text-gray-500">
                                        Section {entry.section || '—'} • {entry.room?.block} {entry.room?.roomNumber}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="font-semibold">{getSubjectFor(fullDay, index)}</div>
                                      <div className="text-gray-400">Section — • —</div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'swap-room':
        return (
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-2" />
              Swap a Room
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">Current Room</h4>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="font-medium">Room 301</p>
                  <p className="text-sm text-gray-600">Capacity: 40 students</p>
                  <p className="text-sm text-gray-600">Equipment: Projector, Whiteboard</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Available Rooms</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition">
                    <p className="font-medium">Room 205</p>
                    <p className="text-sm text-gray-600">Capacity: 35 students</p>
                    <p className="text-sm text-gray-600">Equipment: Smart Board</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition">
                    <p className="font-medium">Room 412</p>
                    <p className="text-sm text-gray-600">Capacity: 45 students</p>
                    <p className="text-sm text-gray-600">Equipment: Projector, Sound System</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                Request Room Swap
              </button>
            </div>
          </div>
        );

      case 'lost-found':
        return (
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Lost & Found
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800">Lost Item</h4>
                <p className="text-sm text-gray-600">Black backpack</p>
                <p className="text-xs text-gray-500">Found in Room 301</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800">Found Item</h4>
                <p className="text-sm text-gray-600">Blue water bottle</p>
                <p className="text-xs text-gray-500">Found in Library</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">✨ Hey {user?.firstName || 'John'}! 👋</h2>
                <p className="text-sm mt-2">
                  Education is the most powerful weapon which you can use to
                  change the world.
                </p>
              </div>
              <img
                src="https://img.freepik.com/free-vector/graduation-concept-illustration_114360-6266.jpg"
                alt="Graduation"
                className="w-32 rounded-lg"
              />
            </div>

            {/* Upcoming Events */}
            <div>
              <h3 className="text-lg font-bold mb-4">Upcoming Events & Notices</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Event Card */}
                <div className="bg-white p-5 rounded-xl shadow">
                  <div className="flex items-center space-x-2 text-blue-600 font-semibold mb-2">
                    <CalendarDays className="w-5 h-5" />
                    <span>Event</span>
                  </div>
                  <h4 className="text-lg font-semibold">Tech Fest 2025</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Annual technology festival with competitions and workshops
                  </p>
                  <p className="text-gray-500 text-xs mt-3">
                    📅 Saturday, February 15, 2025 • 📍 Main Campus
                  </p>
                </div>

                {/* Workshop Card */}
                <div className="bg-white p-5 rounded-xl shadow">
                  <div className="flex items-center space-x-2 text-green-600 font-semibold mb-2">
                    🛠️<span>Workshop</span>
                  </div>
                  <h4 className="text-lg font-semibold">React Development Workshop</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Learn modern React development with hooks and best practices
                  </p>
                  <p className="text-gray-500 text-xs mt-3">
                    📅 Monday, January 20, 2025 • 📍 Tech Center
                  </p>
                </div>

                {/* Seminar Card */}
                <div className="bg-white p-5 rounded-xl shadow">
                  <div className="flex items-center space-x-2 text-orange-600 font-semibold mb-2">
                    🎓<span>Seminar</span>
                  </div>
                  <h4 className="text-lg font-semibold">Career Guidance Session</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    Industry experts sharing insights on career paths in tech
                  </p>
                  <p className="text-gray-500 text-xs mt-3">
                    📅 Friday, January 17, 2025 • 📍 Auditorium
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/teacher');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          method: 'GET',
          headers: {
            'x-auth-token': token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
          // after user loads, fetch timetable metadata and schedule
          await Promise.all([
            fetchBuildingBlocks(token),
            fetchTeacherSchedule(token),
            fetchSections(token)
          ]);
          computeTodaySubjects();
        } else {
          localStorage.removeItem('token');
          navigate('/teacher');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/teacher');
      }
    };

    fetchUserData();
  }, [navigate]);

  const fetchBuildingBlocks = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/building-blocks', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const blocks = await res.json();
        const block = blocks && blocks[0];
        const slots = block?.timeSlots || [];
        if (slots.length === 0) {
          // fallback to default 6 slots so UI is visible even without seeded data
          setTimeSlots([
            { index: 1, start: '10:00', end: '11:00' },
            { index: 2, start: '11:00', end: '12:00' },
            { index: 3, start: '12:00', end: '13:00' },
            { index: 4, start: '13:00', end: '14:00' },
            { index: 5, start: '14:00', end: '15:00' },
            { index: 6, start: '15:00', end: '16:00' }
          ]);
        } else {
          setTimeSlots(slots);
        }
      }
    } catch (e) {
      console.error('Failed to load building blocks', e);
      // network error fallback
      setTimeSlots([
        { index: 1, start: '10:00', end: '11:00' },
        { index: 2, start: '11:00', end: '12:00' },
        { index: 3, start: '12:00', end: '13:00' },
        { index: 4, start: '13:00', end: '14:00' },
        { index: 5, start: '14:00', end: '15:00' },
        { index: 6, start: '15:00', end: '16:00' }
      ]);
    }
  };

  const fetchTeacherSchedule = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/schedules/teacher/me', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setTeacherSchedule(data || []);
      }
    } catch (e) {
      console.error('Failed to load teacher schedule', e);
    }
  };

  const fetchSections = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/sections', {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setSections(data || []);
      }
    } catch (e) {
      console.error('Failed to load sections', e);
    }
  };

  const computeTodaySubjects = () => {
    if (!sections || sections.length === 0 || timeSlots.length === 0) {
      setTodaySubjects([]);
      return;
    }
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    // Combine per-section timetables; for a teacher we might filter later by teacher's subject
    // For now, we take the first section's timetable as reference
    const reference = sections[0];
    const dayEntry = reference?.timetable?.find(d => d.day === todayName);
    const slots = dayEntry?.slots || [];
    // Ensure 6 entries
    const arr = Array.from({ length: timeSlots.length || 7 }, (_, i) => slots[i] || (i === 3 ? 'Lunch' : '—'));
    setTodaySubjects(arr);
  };

  useEffect(() => {
    // recompute when slots or sections change
    computeTodaySubjects();
  }, [sections, timeSlots]);

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">College Portal</h1>

          {/* Profile + Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6" />
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-200">{user.department}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-1 border border-white px-3 py-1 rounded-lg hover:bg-white hover:text-blue-600 transition">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-lg font-bold mb-4">Menu</h3>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('home')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  activeSection === 'home'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </button>
              <button
                onClick={() => setActiveSection('attendance')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  activeSection === 'attendance'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Attendance
              </button>
              <button
                onClick={() => setActiveSection('timetable')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  activeSection === 'timetable'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Timetable
              </button>
              <button
                onClick={() => setActiveSection('lost-found')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  activeSection === 'lost-found'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Lost & Found
              </button>
              <button
                onClick={() => setActiveSection('swap-room')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  activeSection === 'swap-room'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Swap a Room
              </button>
            </nav>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-6">
          {renderMainContent()}
        </div>

        {/* Right Sidebar (Calendar) */}
        <aside className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {daysOfWeek.map((day) => (
              <div key={day} className="font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
            {getDaysInMonth(currentDate).map((day, index) => (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`p-1 rounded cursor-pointer ${
                  !day
                    ? "invisible"
                    : isToday(day)
                    ? "bg-blue-600 text-white font-bold"
                    : isSelected(day)
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          
        </aside>
      </main>
    </div>
  );
};

export default TeacherDashboard;