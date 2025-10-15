import React, { useState, useEffect } from "react";
import TimeTable from "./components/TimeTable";
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
        navigate('/');
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
          localStorage.removeItem('token');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/');
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
          ) : activeSection === 'timetable' ? (
            <TimeTable section={user.section} />
          ) : activeSection === 'faq' ? (
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-bold mb-4">FAQ</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-2">🧭 General</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Q1. What is the Student College Portal?</p>
                      <p className="text-gray-700">It’s an online platform where students can access academic information, attendance, grades, announcements, and other campus services in one place.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q2. How do I log in to the portal?</p>
                      <p className="text-gray-700">Use your college-provided email ID or enrollment number and the default password sent to your registered email. You’ll be asked to change your password after your first login.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q3. I forgot my password. What should I do?</p>
                      <p className="text-gray-700">Click “Forgot Password” on the login page. Enter your registered email — you’ll receive a password reset link.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q4. Can I access the portal from my phone?</p>
                      <p className="text-gray-700">Yes, the portal is mobile-friendly. You can access it via any browser, or download the official app if your college provides one.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">📚 Academics</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Q5. Where can I view my attendance?</p>
                      <p className="text-gray-700">Navigate to Academics → Attendance Report to see your subject-wise attendance percentage.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q6. How do I check my internal marks or exam results?</p>
                      <p className="text-gray-700">Go to Academics → Marks / Results. Both mid-term and final results are available once published by the faculty.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q7. Can I download my timetable or syllabus?</p>
                      <p className="text-gray-700">Yes. Go to Academics → Timetable or Academics → Course Materials to download your syllabus and weekly schedule in PDF format.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">👩‍🏫 Faculty Interaction</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Q8. How can I contact my course faculty?</p>
                      <p className="text-gray-700">Each faculty’s email and contact info are listed under Faculty → Directory. You can also message them directly through the portal’s “Message Faculty” feature if enabled.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q9. I raised a query but didn’t get a response. What should I do?</p>
                      <p className="text-gray-700">Wait for 24–48 hours. If you still don’t get a reply, contact your class coordinator or the academic office.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">💳 Fees & Documents</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Q10. How can I pay my fees online?</p>
                      <p className="text-gray-700">Go to Finance → Fee Payment. Choose your semester, verify the amount, and pay using debit/credit card, UPI, or net banking.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q11. Can I download my fee receipt?</p>
                      <p className="text-gray-700">Yes. After a successful payment, go to Finance → Receipts and click “Download PDF”.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q12. Where can I download my ID card or Bonafide Certificate?</p>
                      <p className="text-gray-700">Check Documents → Certificates section. Some documents may require admin approval before download.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">🧾 Technical Help</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Q13. The portal is not loading or showing an error. What can I do?</p>
                      <p className="text-gray-700">Try clearing your browser cache and cookies, or use another browser. If the issue persists, report it through Help → Report Issue.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q14. My profile details are incorrect. How can I update them?</p>
                      <p className="text-gray-700">Basic info (like address or contact number) can be edited in Profile → Edit Details. For major corrections (like name or DOB), contact the admin office.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-2">🕒 Miscellaneous</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Q15. When will new features or updates be added?</p>
                      <p className="text-gray-700">The portal is updated periodically. Major updates are announced via the Notice Board or your college email.</p>
                    </div>
                    <div>
                      <p className="font-medium">Q16. Can parents/guardians access the portal?</p>
                      <p className="text-gray-700">Some colleges offer a Parent Login to monitor attendance and performance. Check with your admin if that feature is enabled.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
