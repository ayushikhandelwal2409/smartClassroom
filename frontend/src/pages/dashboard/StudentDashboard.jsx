import React, { useState, useEffect } from "react";
import TimeTable from "./components/TimeTable";
import RoomOccupancy from "./components/RoomOccupancy";
import StudentAttendancePage from "./components/attendance/StudentAttendancePage";
import { CalendarDays, LogOut, User, ChevronLeft, ChevronRight, Home, Clock, Users, AlertTriangle, MapPin, BookOpen, ChevronDown, ChevronUp, X, Mail, GraduationCap, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {Pie} from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import LostFound from "../LostFound";
import api from "../../api/axios";


const StudentDashboard = () => {
  // user
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

   //  NEW: events / notices state
  const [events, setEvents] = useState([]);
  // main content state (left menu)
  const [activeSection, setActiveSection] = useState('home');
  // faq accordion state
  const [openFAQ, setOpenFAQ] = useState(null);
  // Profile sidebar state
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  // sidebar visibility state (mobile menu)
  const [showSidebar, setShowSidebar] = useState(false);

  // to store latest lost item
  const [latestLostItem, setLatestLostItem] = useState(null);
// calender state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];



  // attendance chart (dummy)
  
  ChartJS.register(ArcElement, Tooltip, Legend);
  const [pieChartData, setPieChartData] = useState({
  labels: ["Present", "Absent"],
  datasets: [
    {
      data: [0, 0], // initially empty
      backgroundColor: ["#34d399", "#f87171"],
      borderColor: ["#fff", "#fff"],
      borderWidth: 1,
      hoverOffset: 10,
    },
  ],
});

  useEffect(() => {
  if (!user || !user.studentId) {
    console.log("Waiting for user/studentId", user);
    return;
  }

  const fetchAttendanceOverview = async () => {
    try {
      const res = await api.get(`/api/attendance/student/${user.studentId}/overall`);
      const data = res.data;
      setPieChartData({
        labels: ["Present", "Absent"],
        datasets: [
          {
            data: [data.totalPresent, data.totalAbsent],
            backgroundColor: ["#34d399", "#f87171"],
          },
        ],
      });
    } catch (err) {
      console.error("Attendance fetch error:", err);
    }
  };

  fetchAttendanceOverview();
}, [user]);





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
    for (let day = 1; day <= daysInMonth; day++) {
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

   // logout function
  const handleLogout = () => {
  // Remove the token from storage
  localStorage.removeItem('token');
  // Navigate back to the landing page
  navigate('/');
};

  useEffect(() => {

    // fetch user data
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data); // Save user data in state
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        navigate('/');
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

  // Add a loading state while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }
  

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navbar  */}
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
                    src={`${process.env.REACT_APP_API_URL}/${user.image}`} 
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
                <p className="text-sm text-gray-200">Student</p>
              </div>
            </div>
            <button onClick={handleLogout} className="hidden sm:flex flex items-center space-x-2 border border-white px-3 py-1 rounded-lg hover:bg-white hover:text-blue-600 transition">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
            </button>
          </div>
      </header>
        
      {/* Flash Message (Lost and Found) */}
      {activeSection !== 'lost-found' && latestLostItem && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-2 flex items-center space-x-2">
          <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
          <marquee behavior="scroll" direction="left">
            Lost: {latestLostItem.title} — {latestLostItem.description} 
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
            onClick={() => {
              setActiveSection(section)
              setShowSidebar(false);
            }}
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
              
              {section.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
     <main className="min-h-0 flex-1 w-full p-4 lg:p-6 grid grid-cols-1 md:grid-cols-[2fr_240px] lg:grid-cols-[200px_1fr_250px] gap-4 overflow-y-auto lg:overflow-hidden">
        {/* Left Sidebar (desktop only) */}
        <div className="hidden lg:flex bg-white p-4 rounded-xl shadow flex-col h-full overflow-hidden">
          <h3 className="text-lg font-bold mb-4">Menu</h3>
          <nav className="space-y-2">
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
              
              {section.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
          </nav>
        </div>

        {/* Center Content - 60% width */}
        <div className="space-y-6">
          {activeSection === "home" ? (
  <>
    {/* Welcome Banner */}
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow flex items-center justify-between">
      <div>
        <h2 className="text-lg md:text-2xl font-semibold">
          ✨ Hey {user.Name}! 👋
        </h2>
        <p className="text-xs md:text-sm mt-2">
          Education is the most powerful weapon which you can use to change the world.
        </p>
      </div>
      <img
        src="https://img.freepik.com/free-vector/graduation-concept-illustration_114360-6266.jpg"
        alt="Graduation"
        className="w-32 rounded-lg"
      />
    </div>

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
) : 
 activeSection === 'timetable' ? (
            <div className="overflow-y-auto max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-10rem)]" 
              style={{ 
                    scrollbarWidth: "none",
                  }}
            >
              <TimeTable section={user.section} />
            </div>
          ) : activeSection === 'attendance' ? (
            <div className="overflow-y-auto"
              style={{ 
                maxHeight: "calc(100vh - 10rem)",
                scrollbarWidth: "none",
              }}
            >
              <StudentAttendancePage user={user} />
            </div>
          ) : activeSection === 'faq' ? (
            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-extrabold tracking-tight">Frequently Asked Questions</h3>
              </div>
              <div className="space-y-3">
                {/* Item: General - Login */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === 'general' ? null : 'general')}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition"
                  >
                    <span className="text-left font-semibold text-gray-900">How do I log in to the portal?</span>
                    {openFAQ === 'general' ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                  </button>
                  {openFAQ === 'general' && (
                    <div className="p-4 bg-white text-sm text-gray-700">
                      Use your Student ID (10 digits) or Teacher ID (6 digits) and your password. If you are new, contact your coordinator to get credentials.
                    </div>
                  )}
                </div>

                {/* Item: Timetable */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === 'timetable' ? null : 'timetable')}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition"
                  >
                    <span className="text-left font-semibold text-gray-900">Where can I see my timetable?</span>
                    {openFAQ === 'timetable' ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                  </button>
                  {openFAQ === 'timetable' && (
                    <div className="p-4 bg-white text-sm text-gray-700">
                      Open the <span className="font-medium">Time Table</span> section from the left menu. It shows your section-wise schedule.
                    </div>
                  )}
                </div>

                {/* Item: Attendance */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === 'attendance' ? null : 'attendance')}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition"
                  >
                    <span className="text-left font-semibold text-gray-900">How is attendance calculated?</span>
                    {openFAQ === 'attendance' ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                  </button>
                  {openFAQ === 'attendance' && (
                    <div className="p-4 bg-white text-sm text-gray-700">
                      Percentage of classes attended out of total conducted per subject. Check it in the <span className="font-medium">Attendance</span> section.
                    </div>
                  )}
                </div>

                {/* Item: Rooms */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === 'rooms' ? null : 'rooms')}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition"
                  >
                    <span className="text-left font-semibold text-gray-900">How do I check room availability?</span>
                    {openFAQ === 'rooms' ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                  </button>
                  {openFAQ === 'rooms' && (
                    <div className="p-4 bg-white text-sm text-gray-700">
                      Use <span className="font-medium">Room Occupancy</span> for live availability.
                    </div>
                  )}
                </div>

                {/* Item: Technical */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === 'technical' ? null : 'technical')}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition"
                  >
                    <span className="text-left font-semibold text-gray-900">The portal is not loading—what should I do?</span>
                    {openFAQ === 'technical' ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                  </button>
                  {openFAQ === 'technical' && (
                    <div className="p-4 bg-white text-sm text-gray-700">
                      Refresh with hard reload, clear cache, or try another browser. If it continues, report via Help → Report Issue.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ): activeSection === 'lost-found' ? ( 
            <LostFound />
          ) : activeSection === 'room-occupancy' ? (
            <div className="overflow-y-auto"
              style={{ 
                maxHeight: "calc(100vh - 10rem)",
                scrollbarWidth: "none",
              }}
            >
              <RoomOccupancy />
            </div>
          ) : null}
        </div>

        {/* Right Sidebar (Calendar +  Attendance Chart) */}
        <aside className="space-y-4">
          {/* Calendar Section */}
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

          {/* Attendance Pie Chart */}
          <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Attendance Overview</h3>
             <div className="w-28 h-28 sm:w-40 sm:h-40 md:w-40 md:h-40">
              <Pie data={pieChartData} 
                options={{
                        plugins: { legend: { display: false } },
                        animation: { animateRotate: true, animateScale: true },
                        cutout: "55%",
                      }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600 text-center">
              {/* <p><span className="text-green-500 font-semibold">Present:</span> 75%</p>
              <p><span className="text-red-500 font-semibold">Absent:</span> 25%</p> */}
            </div>
          </div>
        </aside>
      </main>

      {/* Profile Sidebar */}
      {showProfileSidebar && (
        <>
          {/* Backdrop - Blur only, no dark overlay */}
          <div 
            className="fixed inset-0 bg-transparent backdrop-blur-md z-40 transition-opacity"
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
                          src={`${process.env.REACT_APP_API_URL}/${user.image}`} 
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
                      <GraduationCap className="w-6 h-6" />
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
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p>
                      <p className="text-lg font-semibold text-gray-800">{user.studentId}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Section</p>
                      <p className="text-lg font-semibold text-gray-800">{user.section}</p>
                    </div>
                  </div>

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

export default StudentDashboard;
