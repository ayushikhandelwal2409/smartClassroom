import React, { useState, useEffect } from "react";
import api from "../../api/axios";

import LostFound from "../LostFound";
import {
  LogOut,
  User,
  Home,
  Clock,
  AlertTriangle,
  MapPin,
  GraduationCap,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminTimetable from "./components/timetable/AdminTimetable";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("home");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [events, setEvents] = useState([]);
  const [latestLostItem, setLatestLostItem] = useState(null);

  // Notice form
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    type: "Notice",
    title: "",
    description: "",
    date: "",
    location: "",
  });

  // Calendar
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= lastDate; d++) days.push(d);
    return days;
  };

  const navigateMonth = (dir) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + (dir === "prev" ? -1 : 1));
      return d;
    });
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ===================== API CALLS =====================

  useEffect(() => {
    const init = async () => {
      try {
        // profile
        const userRes = await api.get("/api/auth/me");
        setUser(userRes.data);

        // events
        const eventsRes = await api.get("/api/admin/events");
        setEvents(eventsRes.data);

        // lost item
        const lostRes = await api.get("/api/lostfound/latest");
        setLatestLostItem(lostRes.data);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    init();
  }, [navigate]);

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/api/admin/events/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch {
      alert("Failed to delete");
    }
  };

  const submitNotice = async () => {
    try {
      await api.post("/api/admin/events", noticeForm);
      alert("Notice created ✅");
      setShowNoticeForm(false);
      setNoticeForm({
        type: "Notice",
        title: "",
        description: "",
        date: "",
        location: "",
      });

      const res = await api.get("/api/admin/events");
      setEvents(res.data);
    } catch {
      alert("Failed to create notice");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Admin Dashboard...
      </div>
    );
  }

  const menuItems = ["home", "timetable", "notice", "lost-found"];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navbar */}
      <header className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center shadow">
        <div className="flex items-center space-x-2">
          <button className="lg:hidden" onClick={() => setShowSidebar(true)}>
            <Menu />
          </button>
          <GraduationCap />
          <h1 className="font-bold text-xl">Smart Classroom</h1>
        </div>

        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setShowProfileSidebar(true)}
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <User className="text-blue-600" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium">{user.Name}</p>
            <p className="text-sm">Admin</p>
          </div>
        </div>
      </header>

      {/* Lost banner */}
      {activeSection !== "lost-found" && latestLostItem && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-2">
          <marquee>
            Lost: {latestLostItem.title} — {latestLostItem.description}
          </marquee>
        </div>
      )}

      <main className="flex-1 grid lg:grid-cols-[200px_1fr_260px] gap-4 p-4">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-white p-4 rounded-xl shadow">
          {menuItems.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className="w-full mb-2 px-3 py-2 rounded hover:bg-gray-100"
            >
              {section.toUpperCase()}
            </button>
          ))}
        </aside>

        {/* Center */}
        <section>
          {activeSection === "home" && (
            <>
              <h2 className="text-2xl font-bold mb-4">Welcome Admin 👋</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {events.map(event => (
                  <div key={event._id} className="bg-white p-4 rounded shadow">
                    <h4 className="font-bold">{event.title}</h4>
                    <p className="text-sm">{event.description}</p>
                    <button
                      onClick={() => deleteEvent(event._id)}
                      className="mt-2 text-xs bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "timetable" && <AdminTimetable />}
          {activeSection === "lost-found" && <LostFound />}

          {activeSection === "notice" && (
            <div className="bg-white p-6 rounded shadow">
              <button
                onClick={() => setShowNoticeForm(!showNoticeForm)}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                + Add Notice
              </button>

              {showNoticeForm && (
                <>
                  <input
                    placeholder="Title"
                    value={noticeForm.title}
                    onChange={e =>
                      setNoticeForm({ ...noticeForm, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Description"
                    value={noticeForm.description}
                    onChange={e =>
                      setNoticeForm({ ...noticeForm, description: e.target.value })
                    }
                  />
                  <button
                    onClick={submitNotice}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Publish
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        {/* Calendar */}
        <aside className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold mb-2">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="grid grid-cols-7 text-xs">
            {daysOfWeek.map(d => (
              <div key={d}>{d}</div>
            ))}
            {getDaysInMonth(currentDate).map((day, i) => (
              <div key={i}>{day}</div>
            ))}
          </div>
        </aside>
      </main>

      {showProfileSidebar && (
        <>
          <div className="fixed inset-0 backdrop-blur" />
          <div className="fixed right-0 top-0 w-80 bg-white h-full p-6 shadow">
            <button onClick={() => setShowProfileSidebar(false)}>
              <X />
            </button>
            <p className="mt-4">{user.Name}</p>
            <button
              onClick={handleLogout}
              className="mt-6 w-full bg-red-600 text-white py-2 rounded"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
