import React, { useState } from "react";
import { CalendarDays, LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";

const StudentDashboard = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">College Portal</h1>

          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:underline">
              Home
            </a>
            <a href="#" className="hover:underline">
              Time Table
            </a>
            <a href="#" className="hover:underline">
              Attendance
            </a>
            <a href="#" className="hover:underline">
              Lost & Found
            </a>
            <a href="#" className="hover:underline">
              Room Occupancy
            </a>
            <a href="#" className="hover:underline">
              Rent a Room
            </a>
            <a href="#" className="hover:underline">
              FAQ
            </a>
          </nav>

          {/* Profile + Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6" />
              <div>
                <p className="font-medium">John Smith</p>
                <p className="text-sm text-gray-200">Computer Science</p>
              </div>
            </div>
            <button className="flex items-center space-x-1 border border-white px-3 py-1 rounded-lg hover:bg-white hover:text-blue-600 transition">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">✨ Hey John! 👋</h2>
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

              {/* Hackathon Card */}
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

              {/* Sports Card */}
              <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex items-center space-x-2 text-red-600 font-semibold mb-2">
                  ⚽<span>Sports</span>
                </div>
                <h4 className="text-lg font-semibold">Inter-College Football Tournament</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Annual football championship with teams from 15 colleges
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  📅 Sunday, January 26, 2025 • 📍 Sports Complex
                </p>
              </div>

              {/* Cultural Card */}
              <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex items-center space-x-2 text-pink-600 font-semibold mb-2">
                  🎭<span>Cultural</span>
                </div>
                <h4 className="text-lg font-semibold">Cultural Night 2025</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Music, dance, and drama performances by talented students
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  📅 Saturday, February 1, 2025 • 📍 Open Air Theater
                </p>
              </div>

              {/* Library Card */}
              <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex items-center space-x-2 text-indigo-600 font-semibold mb-2">
                  📚<span>Library</span>
                </div>
                <h4 className="text-lg font-semibold">New Book Collection Launch</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Explore our latest collection of 500+ new books and e-resources
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  📅 Wednesday, January 22, 2025 • 📍 Central Library
                </p>
              </div>

              {/* Exam Card */}
              <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex items-center space-x-2 text-yellow-600 font-semibold mb-2">
                  📝<span>Academic</span>
                </div>
                <h4 className="text-lg font-semibold">Mid-Term Examinations</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Important dates and guidelines for upcoming mid-term exams
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  📅 Monday, February 3, 2025 • 📍 Various Classrooms
                </p>
              </div>

              {/* Research Card */}
              <div className="bg-white p-5 rounded-xl shadow">
                <div className="flex items-center space-x-2 text-teal-600 font-semibold mb-2">
                  🔬<span>Research</span>
                </div>
                <h4 className="text-lg font-semibold">Research Paper Presentation</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Students showcase their innovative research projects and findings
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  📅 Thursday, January 30, 2025 • 📍 Research Center
                </p>
              </div>
            </div>
          </div>
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
          
          {selectedDate && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Selected: {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default StudentDashboard;
