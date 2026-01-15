import React, { useState, useEffect } from "react";
import { CalendarDays,LogOut, User, ChevronLeft, ChevronRight, Camera, Upload, Clock, MapPin, Users, BookOpen, AlertTriangle, Home, X, Mail, Briefcase, Menu, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TeacherTimeTable from "./components/TeacherTimeTable";
import RoomOccupancy from "./components/RoomOccupancy";
import TeacherAttendancePage from "./components/attendance/TeacherAttendancePage";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import LostFound from "../LostFound";
import Faq from "./components/Faq";
import api from "../../api/axios";


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);


const TeacherDashboard = () => {
  // user
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Main content state
  const [activeSection, setActiveSection] = useState('home');

  // Profile sidebar state
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  // sidebar visibility state (mobile menu)
    const [showSidebar, setShowSidebar] = useState(false);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Attendance states
  const [selectedClass, setSelectedClass] = useState(null);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);

  // to store latest lost item
  const [latestLostItem, setLatestLostItem] = useState(null);

  // Timetable state
  const [timeSlots, setTimeSlots] = useState([]); // from building blocks (6 per day)
  const [teacherSchedule, setTeacherSchedule] = useState([]); // entries from /api/schedules/teacher/me
  const [sections, setSections] = useState([]); // from /api/sections
  const [todaySubjects, setTodaySubjects] = useState([]); // entries for today mapped to timeSlots
  const [teacherTimetable, setTeacherTimetable] = useState([]); // processed teacher timetable

  
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
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/api/admin/events");
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
  
    fetchEvents();
  }, []);

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
          <div className="overflow-y-auto"
            style={{ 
              maxHeight: "calc(100vh - 10rem)",
              scrollbarWidth: "none",
            }}
          >
            <TeacherAttendancePage
              user={user}
              teacherTimetable={teacherTimetable}
            />
          </div>
        );

      case 'timetable':
        return (
          <div className="overflow-y-auto"
            style={{ 
              maxHeight: "calc(100vh - 10rem)",
              scrollbarWidth: "none",
            }}
          >
        
          <TeacherTimeTable 
            teacherId={user?.teacherId}
            sectionsToTeach={user?.sectionsToTeach}
            subjectTaught={user?.subjectTaught}
            />
            </div>
        );

        // no use
      // case 'swap-room':
      //   return (
      //     <div className="bg-white p-6 rounded-xl shadow">
      //       <h3 className="text-xl font-bold mb-6 flex items-center">
      //         <MapPin className="w-6 h-6 mr-2" />
      //         Swap a Room
      //       </h3>
            
      //       <div className="grid md:grid-cols-2 gap-6">
      //         <div>
      //           <h4 className="text-lg font-semibold mb-4">Current Room</h4>
      //           <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      //             <p className="font-medium">Room 301</p>
      //             <p className="text-sm text-gray-600">Capacity: 40 students</p>
      //             <p className="text-sm text-gray-600">Equipment: Projector, Whiteboard</p>
      //           </div>
      //         </div>
              
      //         <div>
      //           <h4 className="text-lg font-semibold mb-4">Available Rooms</h4>
      //           <div className="space-y-3">
      //             <div className="bg-green-50 p-4 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition">
      //               <p className="font-medium">Room 205</p>
      //               <p className="text-sm text-gray-600">Capacity: 35 students</p>
      //               <p className="text-sm text-gray-600">Equipment: Smart Board</p>
      //             </div>
      //             <div className="bg-green-50 p-4 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition">
      //               <p className="font-medium">Room 412</p>
      //               <p className="text-sm text-gray-600">Capacity: 45 students</p>
      //               <p className="text-sm text-gray-600">Equipment: Projector, Sound System</p>
      //             </div>
      //           </div>
      //         </div>
      //       </div>
            
      //       <div className="mt-6">
      //         <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
      //           Request Room Swap
      //         </button>
      //       </div>
      //     </div>
      //   );


      case 'room-occupancy':
        return (
          <div className="overflow-y-auto"
            style={{ 
              maxHeight: "calc(100vh - 10rem)",
              scrollbarWidth: "none",
            }}
          >
            <RoomOccupancy />
          </div>
        );
        case 'lost-found':
        return (
          <LostFound />
        );
        case "faq":
        return <Faq />;

      default:
        return (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">✨ Hey {user?.Name || 'John'}! 👋</h2>
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
              <>
            
                {/* Events & Notices from ADMIN */}
                <div>
                  <h3 className="text-center text-lg font-bold mb-4">
                    Upcoming Events & Notices
                  </h3>
            
                  {events.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No events available
                    </p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {events.map((event) => (
                        <div
                          key={event._id}
                          className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
                        >
                          <div className="flex items-center space-x-2 text-blue-600 font-semibold mb-2">
                            <CalendarDays className="w-5 h-5" />
                            <span>{event.type}</span>
                          </div>
            
                          <h4 className="text-lg font-semibold">
                            {event.title}
                          </h4>
            
                          <p className="text-gray-600 text-sm mt-1">
                            {event.description}
                          </p>
            
                          <p className="text-gray-500 text-xs mt-3">
                            📅 {event.date} • 📍 {event.location}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
          </div>
        );
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/teacher/dashboard');
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
        // after user loads, fetch timetable metadata and schedule
        await Promise.all([
          fetchBuildingBlocks(),
          fetchTeacherSchedule()
        ]);
        // Fetch sections after user is set (needs user.sectionsToTeach)
        if (response.data?.sectionsToTeach) {
          await fetchSections(response.data);
        }
        computeTodaySubjects();
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        navigate('/teacher/dashboard');
      }
    };

    fetchUserData();
    // fetch the latest lost item
    const fetchLatestLostItem = async () => {
      try {
        const res = await api.get("/api/lostfound/latest");
        setLatestLostItem(res.data);
      } catch (error) {
        console.error('Error fetching latest lost item:', error);
      }
    };

    fetchLatestLostItem();

  }, [navigate]);

  const fetchBuildingBlocks = async () => {
    try {
      const res = await api.get('/api/building-blocks');
      const blocks = res.data;
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

  const fetchTeacherSchedule = async () => {
    try {
      const res = await api.get('/api/schedules/teacher/me');
      setTeacherSchedule(res.data || []);
    } catch (e) {
      console.error('Failed to load teacher schedule', e);
    }
  };

  const fetchSections = async (userData = null) => {
    try {
      // Use userData parameter if provided, otherwise fall back to user state
      const userInfo = userData || user;
      console.log('fetchSections - userInfo:', userInfo);
      
      if (userInfo?.sectionsToTeach && userInfo.sectionsToTeach.length > 0) {
        console.log('Fetching timetables for sections:', userInfo.sectionsToTeach);
        const sectionPromises = userInfo.sectionsToTeach.map(sectionName => 
          api.get(`/api/timetable/${sectionName}`)
        );
        
        const responses = await Promise.all(sectionPromises);
        const sectionData = responses.map(res => res.data);
        
        console.log('Fetched section data:', sectionData);
        setSections(sectionData || []);
        
        // Process teacher timetable
        if (sectionData && sectionData.length > 0 && userInfo?.subjectTaught) {
          console.log('Processing teacher timetable with subjects:', userInfo.subjectTaught);
          processTeacherTimetable(sectionData, userInfo.sectionsToTeach, userInfo.subjectTaught);
        }
      } else {
        console.log('No sections to teach or sectionsToTeach is empty');
      }
    } catch (e) {
      console.error('Failed to load sections', e);
    }
  };

  // Process teacher timetable when sections and user data are available
  useEffect(() => {
    if (sections && sections.length > 0 && user?.sectionsToTeach && user?.subjectTaught) {
      processTeacherTimetable(sections, user.sectionsToTeach, user.subjectTaught);
    }
  }, [sections, user]);

  const processTeacherTimetable = (sectionData, sectionsToTeach, subjectTaught) => {
    console.log('processTeacherTimetable called with:', { sectionData, sectionsToTeach, subjectTaught });
    const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const teacherSchedule = [];
    
    // Create a map of all time slots across all days
    const allTimeSlots = new Set();
    sectionData.forEach(section => {
      section.timetable?.forEach(day => {
        day.slots?.forEach(slot => {
          allTimeSlots.add(slot.time);
        });
      });
    });

    console.log('All time slots:', Array.from(allTimeSlots));

    // For each day, create a combined schedule
    DAYS.forEach(dayName => {
      const daySchedule = { day: dayName, slots: [] };
      
      // For each time slot, check if teacher has a class
      allTimeSlots.forEach(timeSlot => {
        let teacherSlot = null;
        
        // Check each section the teacher teaches
        sectionData.forEach((section, sectionIndex) => {
          const dayData = section.timetable?.find(d => d.day === dayName);
          if (dayData) {
            const slot = dayData.slots?.find(s => s.time === timeSlot);
            if (slot && slot.subjectCode && subjectTaught.includes(slot.subjectCode)) {
              // Teacher has a class at this time
              teacherSlot = {
                time: timeSlot,
                subjectCode: slot.subjectCode,
                roomNumber: slot.roomNumber,
                academicBlock: slot.academicBlock,
                sectionName: sectionsToTeach[sectionIndex]
              };
            }
          }
        });
        
        daySchedule.slots.push(teacherSlot || { time: timeSlot, subjectCode: '', roomNumber: '', academicBlock: '', sectionName: '' });
      });
      
      teacherSchedule.push(daySchedule);
    });

    console.log('Processed teacher timetable:', teacherSchedule);
    setTeacherTimetable(teacherSchedule);
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navbar */}
      <header className="bg-blue-600 text-white shadow flex justify-between items-center px-4 sm:px-6 py-3 ">
        {/* Mobile Nav Toggle */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-md hover:bg-blue-700 transition lg:hidden"
            onClick={() => setShowSidebar(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <GraduationCap className="w-7 h-7" />
          <h1 className="text-lg sm:text-2xl font-bold">Smart Classroom</h1>
        </div>

          {/* Profile + Logout */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-2 cursor-pointer hover:bg-blue-700 px-3 py-2 rounded-lg transition-all duration-200"
              onClick={() => setShowProfileSidebar(true)}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                {user.image ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/${user.image}`} 
                    alt={user.Name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full rounded-full bg-blue-500 flex items-center justify-center ${user.image ? 'hidden' : ''}`}
                  style={user.image ? { display: 'none' } : {}}
                >
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="font-medium">{user.Name}</p>
                <p className="text-sm text-gray-200">Teacher</p>
              </div>
            </div>
            <button onClick={handleLogout} className="hidden sm:flex flex items-center space-x-1 border border-white px-3 py-1 rounded-lg hover:bg-white hover:text-blue-600 transition">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        {/* </div> */}
      </header>

      {/* Flash Message (Lost and Found) */}
      {activeSection !== 'lost-found' && latestLostItem && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-2 flex items-center space-x-2">
          <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
          <marquee behavior="scroll" direction="left">
            Lost: {latestLostItem.title} — {latestLostItem.description}. Collect from Lost and Found office.
          </marquee>
        </div>
      )}

      {/* Sidebar Drawer */}
            {showSidebar && (
              <div className="fixed inset-0 z-50 flex">
                <div
                  className="fixed inset-0 bg-black opacity-40"
                  onClick={() => setShowSidebar(false)}
                ></div>
      
              {/* Left Sidebar Menu */}
      
              <div className="relative w-64 bg-white p-4 shadow-lg z-50">
                {/* <div className=""> */}
                <button
                    className="absolute top-4 right-4"
                    onClick={() => setShowSidebar(false)}
                  >
                    <X className="w-6 h-6" />
                  </button>
      
                  <h3 className="text-lg font-bold mb-4">Menu</h3>
                  <nav className="space-y-2">
                    {/* nav button */}
                    {["home", "timetable", "attendance", "lost-found", "room-occupancy", "faq"].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
              activeSection === section
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
          >
              {/* map icons*/}
              {section === "home" && <Home className="w-4 h-4 mr-2" />}
              {section === "timetable" && <Clock className="w-4 h-4 mr-2" />}
              {section === "attendance" && <Users className="w-4 h-4 mr-2" />}
              {section === "lost-found" && <AlertTriangle className="w-4 h-4 mr-2" />}
              {section === "room-occupancy" && <MapPin className="w-4 h-4 mr-2" />}
              {section === "faq" && <BookOpen className="w-4 h-4 mr-2" />}
              {/* {section === "swap-room" && <MapPin className="w-4 h-4 mr-2" />} */}
              
              
              {section.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
                  </nav>
                </div>
              </div>
            )}


      {/* Main content */}
            <main className="min-h-0 flex-1 w-full p-4 lg:p-6 grid grid-cols-1 md:grid-cols-[2fr_240px] lg:grid-cols-[200px_1fr_250px] gap-2 overflow-y-auto lg:overflow-hidden">
              {/* Left Sidebar (desktop only) */}
              <div className="hidden lg:block bg-white p-4 rounded-xl shadow">
                <h3 className="text-lg font-bold mb-4">Menu</h3>
                <nav className="space-y-2">
                  {["home", "timetable", "attendance", "lost-found", "room-occupancy","faq"].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                    activeSection === section
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                    {/* map icons*/}
                    {section === "home" && <Home className="w-4 h-4 mr-2" />}
                    {section === "timetable" && <Clock className="w-4 h-4 mr-2" />}
                    {section === "attendance" && <Users className="w-4 h-4 mr-2" />}
                    {section === "lost-found" && <AlertTriangle className="w-4 h-4 mr-2" />}
                    {section === "room-occupancy" && <MapPin className="w-4 h-4 mr-2" />}
                    {section === "faq" && <BookOpen className="w-4 h-4 mr-2" />}
                    {/* {section === "swap-room" && <MapPin className="w-4 h-4 mr-2" />} */}
                    
                    
                    {section.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </button>
                ))}
                </nav>
              </div>




        {/* Center Content - 60% width */}
        <div className="space-y-6">
          {renderMainContent()}
        </div>

        {/* Right Sidebar (Calendar + Attendance) */}
        <aside className="space-y-4 gap-0">
          {/* Calender */}
          <div className="bg-white p-1 rounded-xl shadow">
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
          </div>

          
        </aside>
      </main>

      {/* Profile Sidebar */}
      {showProfileSidebar && (
        <>
          {/* Backdrop - Blur only, no dark overlay */}
          <div 
            className="fixed inset-0 bg-transparent backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowProfileSidebar(false)}
          ></div>
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-screen w-full sm:w-[450px] bg-gradient-to-b from-blue-50 via-white to-gray-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Profile</h2>
                <button
                  onClick={() => setShowProfileSidebar(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Profile Image - Clickable */}
              <div className="flex justify-center mb-6">
                <div 
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1 cursor-pointer hover:scale-105 transition-transform shadow-lg"
                  onClick={() => {
                    if (user.image) {
                      window.open(`${user.image}`, '_blank');
                    }
                  }}
                >
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                    {user.image ? (
                      <>
                        <img 
                          src={`${import.meta.env.VITE_API_URL}/${user.image}`} 
                          alt={user.Name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.fallback-icon');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="fallback-icon w-full h-full rounded-full bg-blue-500 flex items-center justify-center absolute inset-0"
                          style={{ display: 'none' }}
                        >
                          <User className="w-16 h-16 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="space-y-4">
                {/* Name Card */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-xl shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">Full Name</p>
                      <p className="text-xl font-bold">{user.Name}</p>
                    </div>
                  </div>
                </div>

                {/* Details Card */}
                <div className="bg-white border-2 border-gray-100 p-5 rounded-xl shadow-md space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Teacher ID</p>
                      <p className="text-lg font-semibold text-gray-800">{user.teacherId}</p>
                    </div>
                  </div>

                  {user.sectionsToTeach && user.sectionsToTeach.length > 0 && (
                    <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sections Teaching</p>
                        <div className="flex flex-wrap gap-2">
                          {user.sectionsToTeach.map((section, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.subjectTaught && user.subjectTaught.length > 0 && (
                    <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Subjects Teaching</p>
                        <div className="flex flex-wrap gap-2">
                          {user.subjectTaught.map((subject, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {user.email && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                        <p className="text-sm font-semibold text-gray-800 break-all">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => {
                    setShowProfileSidebar(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-medium shadow-md hover:shadow-lg"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;