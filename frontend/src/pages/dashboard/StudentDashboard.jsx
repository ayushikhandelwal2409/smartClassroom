import React, { useState, useEffect } from "react";
import { CalendarDays, LogOut, User, ChevronLeft, ChevronRight, Home, Clock, Users, AlertTriangle, MapPin, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  // user
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // main content state (left menu)
  const [activeSection, setActiveSection] = useState('home');

 
// calender state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // If no token, redirect to login
        navigate('/student');
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
          setUser(data); // Save user data in state
        } else {
          // If token is invalid, clear it and redirect
          localStorage.removeItem('token');
          navigate('/student');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/student');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Add a loading state while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar (no center links) */}
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">College Portal</h1>

          {/* Profile + Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6" />
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-2 00">{user.department}</p>
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
                onClick={() => setActiveSection('timetable')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  activeSection === 'timetable'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Time Table
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
                onClick={() => setActiveSection('room-occupancy')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  activeSection === 'room-occupancy'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Room Occupancy
              </button>
              <button
                onClick={() => setActiveSection('rent-room')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  activeSection === 'rent-room'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Rent a Room
              </button>
              <button
                onClick={() => setActiveSection('faq')}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  activeSection === 'faq'
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                FAQ
              </button>
            </nav>
          </div>
        </div>

        {/* Center Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeSection === 'home' ? (
            <>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">✨ Hey {user.firstName}! 👋</h2>
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

              <div>
                <h3 className="text-lg font-bold mb-4">Upcoming Events & Notices</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                  <div className="bg-white p-5 rounded-xl shadow">
                    <div className="flex items-center space-x-2 text-purple-600 font-semibold mb-2">
                      ⚡<span>Hackathon</span>
                    </div>
                    <h4 className="text-lg font-semibold">AI/ML Hackathon</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      48-hour coding competition focused on AI and Machine Learning
                    </p>
                    <p className="text-gray-500 text-xs mt-3">
                      📅 Saturday, January 25, 2025 • 📍 Computer Lab
                    </p>
                  </div>

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
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-bold mb-2">{activeSection.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</h3>
              <p className="text-gray-600">This section will be available soon.</p>
            </div>
          )}
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

export default StudentDashboard;
