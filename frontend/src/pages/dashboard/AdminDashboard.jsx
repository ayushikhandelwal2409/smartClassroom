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

    // Notice form state
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

    const [latestLostItem, setLatestLostItem] = useState(null);



    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

    // Fetch admin profile
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/");

            try {
                const res = await api.get("/api/auth/me");
                setUser(res.data);
            } catch {
                localStorage.removeItem("token");
                navigate("/");
            }
        };
        fetchUser();

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

    const deleteEvent = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this notice?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/api/admin/events/${id}`);
    // 🔥 Remove from UI instantly
    setEvents((prev) => prev.filter((e) => e._id !== id));
  } catch (err) {
    alert(err.response?.data?.msg || "Server error");
  }
};


    // Notice handlers
    const handleNoticeChange = (e) => {
        setNoticeForm({ ...noticeForm, [e.target.name]: e.target.value });
    };

    const submitNotice = async () => {
        try {
            await api.post("/api/admin/events", noticeForm);
            alert("Notice created successfully ✅");
            setNoticeForm({
                type: "Notice",
                title: "",
                description: "",
                date: "",
                location: "",
            });
            setShowNoticeForm(false);
        } catch (err) {
            alert(err.response?.data?.msg || "Server error");
        }
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
                    <button className="p-2 rounded-md hover:bg-blue-700 transition lg:hidden" onClick={() => setShowSidebar(true)}>
                        <Menu className="w-6 h-6"/>
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

            {/* Flash Message (Lost and Found) */}
            {activeSection !== 'lost-found' && latestLostItem && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-2 flex items-center space-x-2">
                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
                    <marquee behavior="scroll" direction="left">
                        Lost: {latestLostItem.title} — {latestLostItem.description}
                    </marquee>
                </div>
            )}

            {/* Main */}
            <main className="flex-1 grid lg:grid-cols-[200px_1fr_260px] gap-4 p-4 overflow-y-auto">
                {/* Sidebar */}
                <aside className="hidden lg:block bg-white rounded-xl shadow p-4">
                    <h3 className="font-bold mb-4">Menu</h3>
                    {menuItems.map((section) => (
                        <button
                            key={section}
                            onClick={() => setActiveSection(section)}
                            className={`w-full flex items-center px-3 py-2 rounded-lg mb-2 ${activeSection === section
                                ? "bg-blue-100 text-blue-700"
                                : "hover:bg-gray-100"
                                }`}
                        >
                            {section === "home" && <Home className="mr-2" />}
                            {section === "timetable" && <Clock className="mr-2" />}
                            {section === "notice" && <AlertTriangle className="mr-2" />}
                            {section === "lost-found" && <MapPin className="mr-2" />}
                            {section.replace("-", " ").toUpperCase()}
                        </button>
                    ))}
                </aside>

                {/* Center */}
                <section className="space-y-6">
                    {activeSection === "home" && (
                        <div>
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow">
                                <h2 className="text-2xl font-bold">Welcome Admin 👋</h2>
                                <p className="mt-2 text-sm">
                                    Manage timetable, notices and campus resources.
                                </p>
                            </div>
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
                                                <button
                                                    onClick={() => deleteEvent(event._id)}
                                                    className=" my-2 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    )}


                    {activeSection === "timetable" && <AdminTimetable />}

                    {activeSection === "notice" && (
                        <div className="bg-white p-6 rounded-xl shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">📢 Notices</h2>
                                <button
                                    onClick={() => setShowNoticeForm(!showNoticeForm)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    + Add Notice
                                </button>
                            </div>

                            {showNoticeForm && (
                                <div className="border rounded-xl p-5 bg-gray-50 space-y-4">
                                    <select
                                        name="type"
                                        value={noticeForm.type}
                                        onChange={handleNoticeChange}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option>Event</option>
                                        <option>Hackathon</option>
                                        <option>Workshop</option>
                                        <option>Seminar</option>
                                        <option>Notice</option>
                                    </select>

                                    <input
                                        type="text"
                                        name="date"
                                        placeholder="Friday, January 17, 2025"
                                        value={noticeForm.date}
                                        onChange={handleNoticeChange}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />

                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="Title"
                                        value={noticeForm.title}
                                        onChange={handleNoticeChange}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />

                                    <textarea
                                        name="description"
                                        rows="3"
                                        placeholder="Description"
                                        value={noticeForm.description}
                                        onChange={handleNoticeChange}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />

                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Location"
                                        value={noticeForm.location}
                                        onChange={handleNoticeChange}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowNoticeForm(false)}
                                            className="px-4 py-2 border rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={submitNotice}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                        >
                                            Publish
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === "lost-found" && <LostFound />}
                </section>

                {/* Calendar */}
                <aside className="bg-white rounded-xl shadow p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h3>
                        <div className="flex space-x-1">
                            <button onClick={() => navigateMonth("prev")}><ChevronLeft /></button>
                            <button onClick={() => navigateMonth("next")}><ChevronRight /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 text-xs text-center">
                        {daysOfWeek.map(d => (
                            <div key={d} className="font-medium text-gray-500">{d}</div>
                        ))}
                        {getDaysInMonth(currentDate).map((day, index) => (
                            <div
                                key={index}
                                onClick={() => handleDateClick(day)}
                                className={`p-1 rounded cursor-pointer ${!day
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

            {/* Profile Sidebar */}
            {showProfileSidebar && (
                <>
                    <div
                        className="fixed inset-0 backdrop-blur z-40"
                        onClick={() => setShowProfileSidebar(false)}
                    />
                    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow z-50 p-6">
                        <button onClick={() => setShowProfileSidebar(false)} className="mb-4">
                            <X />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Admin Profile</h2>
                        <p><b>Name:</b> {user.Name}</p>
                        <p className="mt-2"><b>Role:</b> Admin</p>

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
