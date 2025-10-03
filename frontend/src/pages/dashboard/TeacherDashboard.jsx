import React, { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";



// --- Placeholder Components ---
const WelcomeSection = ({ teacherName }) => (
  <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-2xl shadow">
    <h2 className="text-2xl font-semibold">✨ Welcome back, {teacherName}! 👋</h2>
    <p className="mt-2">"A good teacher can inspire hope, ignite the imagination, and instill a love of learning."</p>
  </div>
);

const TimeTableSection = () => <div className="bg-white p-6 rounded-2xl shadow"><h3>My Time Table</h3></div>;
const AttendanceSection = () => <div className="bg-white p-6 rounded-2xl shadow"><h3>Mark Attendance</h3></div>;
const LostFoundSection = () => <div className="bg-white p-6 rounded-2xl shadow"><h3>Lost & Found</h3></div>;
const FAQSection = () => <div className="bg-white p-6 rounded-2xl shadow"><h3>FAQ</h3></div>;


const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  // --- Authentication and Data Fetching ---
  useEffect(() => {
    const fetchTeacherData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/teacher');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { 'x-auth-token': token },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.role === 'teacher') {
            setTeacher(data);
          } else {
            localStorage.removeItem('token');
            navigate('/teacher');
          }
        } else {
          localStorage.removeItem('token');
          navigate('/teacher');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/teacher');
      }
    };
    fetchTeacherData();
  }, [navigate]);

  // --- Calendar Logic ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // This will now be used
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) { days.push(null); }
    for (let day = 1; day <= daysInMonth; day++) { days.push(day); }
    return days;
  };
  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };
  
  // --- NEW: Calendar Interaction Functions ---
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

  // --- Logout Functionality ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // --- Navigation Items ---
  const navItems = [
    { key: 'home', label: 'Home' },
    { key: 'timetable', label: 'Time Table' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'lostfound', label: 'Lost & Found' },
    { key: 'faq', label: 'FAQ' },
  ];

  // --- Content Rendering Logic ---
  const renderContent = () => {
    switch (activeSection) {
      case 'home': return <WelcomeSection teacherName={teacher.firstName} />;
      case 'timetable': return <TimeTableSection />;
      case 'attendance': return <AttendanceSection />;
      case 'lostfound': return <LostFoundSection />;
      case 'faq': return <FAQSection />;
      default: return <WelcomeSection teacherName={teacher.firstName} />;
    }
  };

  // --- Loading State ---
  if (!teacher) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl font-semibold">Loading Teacher Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-green-600 text-white shadow-md">
         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Teacher Portal</h1>

          {/* --- NAVIGATION MOVED HERE --- */}
          <nav className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeSection === item.key
                    ? 'bg-green-700 text-white' // Style for active tab
                    : 'text-green-200 hover:bg-green-700 hover:text-white' // Style for inactive tabs
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Profile and Logout Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6" />
              <div>
                <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                <p className="text-sm text-gray-200">{teacher.title}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-1 border border-white px-3 py-1 rounded-lg hover:bg-white hover:text-green-600 transition">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area (Left Side) */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>

        

        {/* Right Sidebar with Calendar */}
        <aside className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex space-x-1">
              <button onClick={() => navigateMonth('prev')} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => navigateMonth('next')} className="p-1 hover:bg-gray-100 rounded">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {daysOfWeek.map((day) => (<div key={day} className="font-medium text-gray-500 py-1">{day}</div>))}
            {/* --- UPDATED: Calendar Day Rendering --- */}
            {getDaysInMonth(currentDate).map((day, index) => (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`p-1 rounded cursor-pointer ${
                  !day
                    ? "invisible"
                    : isToday(day)
                    ? "bg-green-600 text-white font-bold" // Highlight for today
                    : isSelected(day)
                    ? "bg-green-100 text-green-600 font-semibold" // Highlight for selected day
                    : "hover:bg-gray-100"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          {selectedDate && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-semibold">
                Today: {selectedDate.toLocaleDateString('en-US', { dateStyle: 'full' })}
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default TeacherDashboard;